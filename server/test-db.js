const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    const adminCount = await prisma.admin.count();
    console.log(`📊 Number of admins in database: ${adminCount}`);
    
    const eventCount = await prisma.event.count();
    console.log(`📅 Number of events in database: ${eventCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
