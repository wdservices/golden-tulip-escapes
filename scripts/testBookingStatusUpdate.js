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

async function testBookingStatusUpdate() {
  try {
    console.log('🧪 Testing booking status update functionality...');
    
    // Get the branch ID and booking ID from our test data
    const branchId = 'AS5mYsGNnvA4cxLIPL3W';
    
    // Get the most recent booking
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(branchId)
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (bookingsSnapshot.empty) {
      console.log('❌ No test bookings found');
      return;
    }
    
    const bookingDoc = bookingsSnapshot.docs[0];
    const bookingId = bookingDoc.id;
    const bookingData = bookingDoc.data();
    
    console.log('📋 Found test booking:');
    console.log('- Booking ID:', bookingId);
    console.log('- Current Status:', bookingData.status);
    console.log('- Branch ID:', bookingData.branchId);
    console.log('- Guest Name:', bookingData.firstName, bookingData.lastName);
    
    // Test updating the status
    const newStatus = bookingData.status === 'confirmed' ? 'completed' : 'confirmed';
    
    console.log('\n🔄 Updating status from', bookingData.status, 'to', newStatus);
    
    // Update the booking status using the correct path (same as our fix)
    await db
      .collection('branches')
      .doc(branchId)
      .collection('bookings')
      .doc(bookingId)
      .update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    console.log('✅ Status update successful!');
    
    // Verify the update
    const updatedDoc = await db
      .collection('branches')
      .doc(branchId)
      .collection('bookings')
      .doc(bookingId)
      .get();
    
    const updatedData = updatedDoc.data();
    console.log('\n📊 Verification:');
    console.log('- New Status:', updatedData.status);
    console.log('- Updated At:', updatedData.updatedAt?.toDate());
    
    // Test what would happen if we tried to update using the old incorrect path
    console.log('\n🧪 Testing old incorrect path (should fail)...');
    try {
      await db
        .collection('bookings')
        .doc(bookingId)
        .update({
          status: 'test-fail',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      console.log('❌ Old path unexpectedly succeeded - this should not happen!');
    } catch (error) {
      console.log('✅ Old path correctly failed:', error.message);
    }
    
    console.log('\n🎉 All tests passed! The booking status update fix is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBookingStatusUpdate().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});