import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../service-account.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function createTestBookingForClient() {
  try {
    console.log('🏨 Creating test booking for client spellz49@gmail.com');
    
    // Client details
    const clientId = '32C17pYhpD5xuaf1RcSq';
    const clientEmail = 'spellz49@gmail.com';
    
    // Use the correct branch ID from the debug output
    const branchId = 'AS5mYsGNnvA4cxLIPL3W';
    const bookingData = {
      userId: clientId,
      email: clientEmail,
      firstName: 'Test',
      lastName: 'User',
      branchId: branchId,
      branchName: 'GOLDEN TULIP EVO ROAD',
      roomType: 'deluxe',
      checkInDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
      checkOutDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-18')), // 3 nights
      bookingDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-10')),
      guests: 2,
      nights: 3,
      totalAmount: 45000,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      specialRequests: 'Test booking for dashboard display',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    // Add booking to the correct branch subcollection
    const bookingRef = await db.collection('branches')
      .doc(branchId)
      .collection('bookings')
      .add(bookingData);
    
    console.log('✅ Test booking created with ID:', bookingRef.id);
    
    // Create another past booking for more data
    const pastBookingData = {
      ...bookingData,
      checkInDate: admin.firestore.Timestamp.fromDate(new Date('2023-12-20')),
      checkOutDate: admin.firestore.Timestamp.fromDate(new Date('2023-12-23')), // 3 nights
      bookingDate: admin.firestore.Timestamp.fromDate(new Date('2023-12-15')),
      nights: 3,
      totalAmount: 42000,
      specialRequests: 'Past test booking for dashboard display'
    };
    
    const pastBookingRef = await db.collection('branches')
      .doc(branchId)
      .collection('bookings')
      .add(pastBookingData);
    
    console.log('✅ Past test booking created with ID:', pastBookingRef.id);
    
    // Create an upcoming booking
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    const futureCheckOut = new Date(futureDate);
    futureCheckOut.setDate(futureCheckOut.getDate() + 2); // 2 nights
    
    const upcomingBookingData = {
      ...bookingData,
      checkInDate: admin.firestore.Timestamp.fromDate(futureDate),
      checkOutDate: admin.firestore.Timestamp.fromDate(futureCheckOut),
      bookingDate: admin.firestore.Timestamp.now(),
      nights: 2,
      totalAmount: 30000,
      status: 'confirmed',
      specialRequests: 'Upcoming test booking for dashboard display'
    };
    
    const upcomingBookingRef = await db.collection('branches')
      .doc(branchId)
      .collection('bookings')
      .add(upcomingBookingData);
    
    console.log('✅ Upcoming test booking created with ID:', upcomingBookingRef.id);
    
    console.log('\n📊 Summary:');
    console.log('- Client ID:', clientId);
    console.log('- Client Email:', clientEmail);
    console.log('- Branch ID:', branchId);
    console.log('- Total bookings created: 3');
    console.log('- Total nights: 8 (3 + 3 + 2)');
    console.log('- Past bookings: 2 (6 nights total)');
    console.log('- Upcoming bookings: 1 (2 nights)');
    console.log('- Favorite branch: GOLDEN TULIP EVO ROAD');
    
  } catch (error) {
    console.error('❌ Error creating test booking:', error);
  }
}

createTestBookingForClient().then(() => {
  console.log('\n✅ Test booking creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});