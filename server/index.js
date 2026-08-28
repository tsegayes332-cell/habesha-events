const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const nodemailer = require('nodemailer');
const { Chapa } = require('chapa-nodejs');
require('dotenv').config();

const rateLimit = require('express-rate-limit');

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY,
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server (Chapa webhooks send no Origin header)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Rate limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/admin/signup', authLimiter);
app.use('/api/events/submit', submitLimiter);
app.use('/api/tickets/purchase', submitLimiter);

class PurchaseError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.text({ limit: '10mb' }));

// Root Route
app.get('/', (req, res) => {
  res.send('Habesha Events API is running! 🚀');
});

// Ticket Purchase and Verification Endpoints

// POST /api/tickets/purchase - Initialize Chapa payment
app.post('/api/tickets/purchase', async (req, res) => {
  const { event_id, buyer_name, buyer_email, buyer_phone, quantity } = req.body;

  if (!event_id || !buyer_name || !buyer_email || !buyer_phone || !quantity) {
    return res.status(400).json({ error: 'Missing required buyer information' });
  }

  const eventId = parseInt(event_id);
  const qty = parseInt(quantity);

  if (!eventId || !qty || qty < 1 || qty > 10) {
    return res.status(400).json({ error: 'Invalid event or quantity' });
  }

  try {
    // Lazy cleanup of abandoned pending tickets (checkouts older than 1 hour)
    await prisma.ticket.deleteMany({
      where: {
        status: 'pending',
        created_at: { lt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    const { ticket, eventTitle } = await prisma.$transaction(async (tx) => {
      // Lock the event row so concurrent purchases cannot oversell
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({ where: { id: eventId } });

      if (!event) {
        throw new PurchaseError('Event not found', 404);
      }

      if (event.is_free || !event.ticket_price || event.ticket_price <= 0) {
        throw new PurchaseError('This event does not accept online payments', 400);
      }

      if (event.end_date && new Date(event.end_date) < new Date()) {
        throw new PurchaseError('This event has already ended', 400);
      }

      if (event.ticket_capacity && event.tickets_sold + qty > event.ticket_capacity) {
        throw new PurchaseError('Tickets sold out or insufficient capacity', 400);
      }

      const ticket_code = `HE-${nanoid(10).toUpperCase()}`;
      const total_price = event.ticket_price * qty;

      // Create pending ticket
      const ticket = await tx.ticket.create({
        data: {
          event_id: event.id,
          buyer_name,
          buyer_email,
          buyer_phone,
          quantity: qty,
          total_price,
          ticket_code,
          status: 'pending',
          tx_ref: ticket_code,
        },
      });

      return { ticket, eventTitle: event.title };
    });

    // Initialize Chapa Payment
    const paymentData = {
      amount: ticket.total_price.toString(),
      currency: 'ETB',
      email: buyer_email,
      first_name: buyer_name,
      phone_number: buyer_phone,
      tx_ref: ticket.ticket_code,
      callback_url: `${process.env.SERVER_URL}/api/tickets/verify`,
      return_url: `${process.env.FRONTEND_URL}/ticket-success?code=${ticket.ticket_code}`,
      customization: {
        title: 'Habesha Events Ticket',
        description: `Ticket for ${eventTitle}`,
      },
    };

    // ── LIVE CHAPA PAYMENT ──────────────────────────────────────────
    const response = await chapa.initialize(paymentData);

    if (response.status === 'success') {
      res.json({ checkout_url: response.data.checkout_url });
    } else {
      res.status(500).json({ error: 'Failed to initialize payment with Chapa' });
    }
    // ────────────────────────────────────────────────────────────────
  } catch (error) {
    console.error('Purchase error:', error);
    if (error instanceof PurchaseError) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error during purchase' });
  }
});

// POST /api/tickets/verify - Chapa webhook/callback
app.post('/api/tickets/verify', async (req, res) => {
  const { tx_ref } = req.body;
  
  if (!tx_ref) {
    return res.status(400).json({ error: 'Transaction reference missing' });
  }

  try {
    const verification = await chapa.verify({ tx_ref });

    if (verification.status === 'success') {
      const ticket = await prisma.ticket.findUnique({
        where: { ticket_code: tx_ref },
        include: { event: true }
      });

      if (ticket && ticket.status === 'pending') {
        // Update ticket and event
        await prisma.$transaction([
          prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: 'paid' }
          }),
          prisma.event.update({
            where: { id: ticket.event_id },
            data: { tickets_sold: { increment: ticket.quantity } }
          })
        ]);

        // Send Email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: `"Habesha Events" <${process.env.EMAIL_USER}>`,
          to: ticket.buyer_email,
          subject: `Ticket Confirmed: ${ticket.event.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #e11d48;">Habesha Events</h2>
              <p>Hello <strong>${ticket.buyer_name}</strong>,</p>
              <p>Your payment was successful! Your ticket for <strong>${ticket.event.title}</strong> is confirmed.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket Code:</strong> <span style="font-family: monospace; font-size: 1.2rem;">${ticket.ticket_code}</span></p>
                <p><strong>Quantity:</strong> ${ticket.quantity}</p>
                <p><strong>Date:</strong> ${new Date(ticket.event.start_date).toLocaleString()}</p>
                <p><strong>Location:</strong> ${ticket.event.location_name}, ${ticket.event.city}</p>
              </div>
              <p>Please present this code at the entrance.</p>
              <p>Enjoy the event!</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log('Confirmation email sent to', ticket.buyer_email);
        } catch (err) {
          console.error('Email error:', err);
        }
      }
      
      return res.status(200).send('Verified');
    }
    
    res.status(400).send('Verification failed');
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Internal server error');
  }
});

// Cloudinary Configuration
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
  }
});

// Middleware for basic error logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// POST /api/upload - Cloudinary file upload endpoint (Base64)
app.post('/api/upload', async (req, res) => {
  console.log('Upload request received via text Base64');
  
  try {
    const image = req.body;
    
    if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
      console.log('Invalid image data in request');
      return res.status(400).json({ error: 'Invalid or missing image data' });
    }
    
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(image, { 
      folder: 'habesha-events', 
      resource_type: "auto" 
    });
    
    console.log('File uploaded to Cloudinary:', result.secure_url);
    res.json({ url: result.secure_url });
    
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Cloudinary error: ' + (err.message || 'Failed to upload') });
  }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/events/submit - Submit a new event
app.post('/api/events/submit', async (req, res) => {
  const { 
    title, description, category, city, location_name, 
    start_date, end_date, image_url, ticket_url, 
    organizer_name, organizer_email, is_free,
    ticket_price, ticket_capacity
  } = req.body;

  // Validation
  const requiredFields = {
    title, description, category, city, location_name, 
    start_date, organizer_name, organizer_email
  };

  const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      fields: missingFields 
    });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        city,
        location_name,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : new Date(start_date),
        image_url,
        ticket_url,
        organizer_name,
        organizer_email,
        is_free: is_free === true || is_free === 'true',
        status: 'pending', // Always pending on submission
        ticket_price: ticket_price ? parseFloat(ticket_price) : null,
        ticket_capacity: ticket_capacity ? parseInt(ticket_capacity) : null,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(500).json({ error: error.message || 'Failed to submit event' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Signup
app.post('/api/admin/signup', async (req, res) => {
  const { email, password, invite_code } = req.body;

  if (!process.env.ADMIN_INVITE_CODE) {
    return res.status(503).json({ error: 'Admin signup is disabled. Set ADMIN_INVITE_CODE to enable it.' });
  }

  if (!invite_code || invite_code !== process.env.ADMIN_INVITE_CODE) {
    return res.status(403).json({ error: 'Invalid admin invite code' });
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all pending events
app.get('/api/admin/events/pending', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending events' });
  }
});

// Admin: Get all events
app.get('/api/admin/events/all', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all events' });
  }
});

// Admin: Approve event
app.put('/api/admin/events/:id/approve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve event' });
  }
});

// Admin: Reject event
app.put('/api/admin/events/:id/reject', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject event' });
  }
});

// Admin: Update event details
app.put('/api/admin/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const allowed = [
    'title', 'description', 'category', 'city', 'location_name',
    'start_date', 'end_date', 'image_url', 'organizer_name',
    'organizer_email', 'is_free', 'ticket_price', 'ticket_capacity',
  ];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: update,
    });
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Admin: Delete event
app.delete('/api/admin/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { event_id: parseInt(id) } }),
      prisma.event.delete({ where: { id: parseInt(id) } }),
    ]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /api/events/filter - dynamic filtering and sorting with pagination
app.get('/api/events/filter', async (req, res) => {
  const { search, city, category, is_free, date_range, sort, page = 1, limit = 12 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    let where = {
      status: 'approved',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city && city !== 'All Cities') {
      where.city = city;
    }

    if (category && category !== 'All Categories') {
      where.category = category;
    }

    if (is_free !== undefined && is_free !== '') {
      where.is_free = is_free === 'true';
    }

    if (date_range) {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      let endDate = new Date();

      if (date_range === 'today') {
        endDate = new Date(new Date().setHours(23, 59, 59, 999));
        where.start_date = {
          gte: todayStart,
          lte: endDate,
        };
      } else if (date_range === 'this_week') {
        endDate.setDate(todayStart.getDate() + 7);
        where.start_date = {
          gte: todayStart,
          lte: endDate,
        };
      } else if (date_range === 'this_month') {
        endDate.setMonth(todayStart.getMonth() + 1);
        where.start_date = {
          gte: todayStart,
          lte: endDate,
        };
      }
    }

    let orderBy = { start_date: 'asc' };
    if (sort === 'newest') {
      orderBy = { created_at: 'desc' };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error filtering events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events - return all events where status = "approved", ordered by start_date ascending
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'approved',
      },
      orderBy: {
        start_date: 'asc',
      },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:id - return a single event by ID
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /sitemap.xml - Dynamic sitemap for SEO
app.get('/sitemap.xml', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'approved' },
      select: { id: true, created_at: true },
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://habeshaevents.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/browse</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/submit</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    events.forEach((event) => {
      xml += `
  <url>
    <loc>${baseUrl}/events/${event.id}</loc>
    <lastmod>${event.created_at.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
