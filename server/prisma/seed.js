const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@habeshaevents.com' },
    update: {},
    create: {
      email: 'admin@habeshaevents.com',
      password: adminPassword,
    },
  });
  console.log('Admin user seeded');

  const events = [
    {
      title: 'Addis Music Festival',
      description: 'A grand celebration of Ethiopian music featuring top artists from across the country.',
      category: 'Music',
      city: 'Addis Ababa',
      location_name: 'Meskel Square',
      start_date: new Date('2025-06-15T18:00:00Z'),
      end_date: new Date('2025-06-15T23:59:59Z'),
      image_url: 'https://images.unsplash.com/photo-1514525253361-bee243870eb2?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Addis Entertainment',
      organizer_email: 'info@addisent.com',
      is_free: false,
      status: 'approved',
    },
    {
      title: 'Tech Expo Ethiopia',
      description: 'The largest technology exhibition in East Africa, showcasing the latest innovations.',
      category: 'Tech',
      city: 'Addis Ababa',
      location_name: 'Millennium Hall',
      start_date: new Date('2025-07-20T09:00:00Z'),
      end_date: new Date('2025-07-22T17:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Ethio Tech Hub',
      organizer_email: 'contact@ethiotech.com',
      is_free: true,
      status: 'approved',
    },
    {
      title: 'Dire Dawa Cultural Night',
      description: 'An evening of traditional dance, music, and food representing the diverse cultures of Dire Dawa.',
      category: 'Culture',
      city: 'Dire Dawa',
      location_name: 'Dire Dawa Stadium',
      start_date: new Date('2025-08-05T19:00:00Z'),
      end_date: new Date('2025-08-05T23:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Dire Events',
      organizer_email: 'events@dire.com',
      is_free: true,
      status: 'approved',
    },
    {
      title: 'Hawassa Lake Marathon',
      description: 'A scenic marathon around the beautiful Lake Hawassa, open to all fitness levels.',
      category: 'Sports',
      city: 'Hawassa',
      location_name: 'Hawassa Lake Side',
      start_date: new Date('2025-09-10T06:00:00Z'),
      end_date: new Date('2025-09-10T12:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Hawassa Athletics',
      organizer_email: 'run@hawassa.com',
      is_free: false,
      status: 'approved',
    },
    {
      title: 'Gondar Heritage Tour',
      description: 'Explore the historical castles and churches of Gondar with expert local guides.',
      category: 'Culture',
      city: 'Gondar',
      location_name: 'Fasil Ghebbi',
      start_date: new Date('2025-10-12T08:00:00Z'),
      end_date: new Date('2025-10-12T16:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Gondar Tours',
      organizer_email: 'info@gondartours.com',
      is_free: false,
      status: 'approved',
    },
    {
      title: 'Bahir Dar Food Festival',
      description: 'Taste the best of Ethiopian cuisine by the shores of Lake Tana.',
      category: 'Food',
      city: 'Bahir Dar',
      location_name: 'Lake Tana Front',
      start_date: new Date('2025-11-20T11:00:00Z'),
      end_date: new Date('2025-11-20T21:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Lake Tana Eats',
      organizer_email: 'food@tana.com',
      is_free: true,
      status: 'approved',
    },
    {
      title: 'Ethio Business Forum',
      description: 'A networking event for entrepreneurs and investors to discuss the future of Ethiopian economy.',
      category: 'Business',
      city: 'Addis Ababa',
      location_name: 'Sheraton Addis',
      start_date: new Date('2025-12-05T09:00:00Z'),
      end_date: new Date('2025-12-05T17:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1475721027185-404ece7741ec?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Business Connect',
      organizer_email: 'info@bizconnect.com',
      is_free: false,
      status: 'approved',
    },
    {
      title: 'Addis Tech Summit',
      description: 'Deep dive into software development and AI trends with global speakers.',
      category: 'Tech',
      city: 'Addis Ababa',
      location_name: 'Science Museum',
      start_date: new Date('2026-01-15T09:00:00Z'),
      end_date: new Date('2026-01-16T18:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Code Ethiopia',
      organizer_email: 'dev@codeethio.com',
      is_free: true,
      status: 'approved',
    },
    {
      title: 'Gondar Art Exhibition',
      description: 'A showcase of contemporary Ethiopian art by local and international artists.',
      category: 'Art',
      city: 'Gondar',
      location_name: 'Gondar Art Gallery',
      start_date: new Date('2026-02-10T10:00:00Z'),
      end_date: new Date('2026-02-20T18:00:00Z'),
      image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'Art Gondar',
      organizer_email: 'gallery@artgondar.com',
      is_free: true,
      status: 'approved',
    },
    {
      title: 'Hawassa Education Fair',
      description: 'Information session for students looking for higher education opportunities in Ethiopia and abroad.',
      category: 'Education',
      city: 'Hawassa',
      location_name: 'Hawassa University',
      start_date: new Date('2026-03-05T08:30:00Z'),
      end_date: new Date('2026-03-05T16:30:00Z'),
      image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1000',
      organizer_name: 'EduLink Ethiopia',
      organizer_email: 'info@edulink.com',
      is_free: true,
      status: 'approved',
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
