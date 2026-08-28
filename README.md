# Habesha Events 🇪🇹

Discover and share the most exciting events across Ethiopia. From music festivals and tech workshops to cultural celebrations and sports events, Habesha Events is your go-to directory for what's happening in Addis Ababa and beyond.

## 🚀 Features

- **Event Discovery**: Browse, search, and filter events by city, category, date, and price.
- **Dynamic Filtering**: Real-time filtering with URL synchronization.
- **Event Submission**: Anyone can submit an event for review.
- **Social Sharing**: Share events on WhatsApp, Telegram, or copy links with one click.
- **Google Calendar Integration**: Add events to your calendar instantly.
- **Admin Panel**: Secure dashboard for admins to approve, reject, and manage events.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **SEO & Performance**: Dynamic meta tags, sitemaps, and optimized loading with skeletons and lazy loading.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, react-helmet-async.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: PostgreSQL.
- **Media**: Cloudinary (Image uploads).
- **Authentication**: JWT & Bcrypt.

---

## 💻 Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd habesha-events
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` folder (use `.env.example` as a guide).
- Set your `DATABASE_URL` (PostgreSQL).
- Set `JWT_SECRET` for authentication.
- Set Cloudinary credentials for image handling.

#### Database Migration & Seeding
```bash
npx prisma db push
npm run seed
```

#### Run Server
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
- Create a `.env` file in the `client` folder (use `.env.example` as a guide).
- Set `VITE_API_URL` (e.g., http://localhost:5000).
- Set Cloudinary `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.

#### Run Client
```bash
npm run dev
```

---

## 📡 API Documentation

### Public Endpoints
- `GET /api/events/filter`: Filter events with search, city, category, date_range, and pagination.
- `GET /api/events/:id`: Get a single event by ID.
- `POST /api/events/submit`: Submit a new event (sets status to pending).
- `GET /sitemap.xml`: Dynamic sitemap for search engines.

### Admin Endpoints (Requires JWT)
- `POST /api/admin/login`: Authenticate admin and return JWT.
- `GET /api/admin/events/pending`: Fetch all events awaiting review.
- `GET /api/admin/events/all`: Fetch all events in the system.
- `PUT /api/admin/events/:id/approve`: Set event status to "approved".
- `PUT /api/admin/events/:id/reject`: Set event status to "rejected".
- `DELETE /api/admin/events/:id`: Permanently delete an event.

---

## 🌍 Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Set the Root Directory to `client`.
4. Add all `VITE_` environment variables in the Vercel dashboard.
5. Deploy.

### Backend (Railway / Render)
1. Push your code to GitHub.
2. Connect your repository to Railway/Render.
3. Set the Root Directory to `server`.
4. Add all environment variables (DATABASE_URL, JWT_SECRET, etc.).
5. The `Procfile` will handle the start command.
6. Deploy.

---

## 📸 Screenshots

*(Add your screenshots here)*

---

## 📄 License

MIT License - feel free to use this project for your own needs.
