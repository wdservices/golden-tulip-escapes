import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Read service account key
const serviceAccount = JSON.parse(
  await readFile(new URL('../service-account.json', import.meta.url))
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fetchEVOBooking() {
  try {
    const branchId = 'URcvGkmbfrOFInlOS4I9';
    const bookingId = 'Pe3vOAoHimgKk1QHPVuG';
    
    console.log(`Fetching booking ${bookingId} from branch ${branchId}...`);
    
    // Fetch the booking document
    const bookingDoc = await db
      .collection('branches')
      .doc(branchId)
      .collection('bookings')
      .doc(bookingId)
      .get();
    
    if (bookingDoc.exists) {
      console.log('✅ Booking found!');
      console.log('Booking data:', JSON.stringify(bookingDoc.data(), null, 2));
      
      // Check for payments subcollection
      const paymentsSnapshot = await db
        .collection('branches')
        .doc(branchId)
        .collection('bookings')
        .doc(bookingId)
        .collection('payments')
        .get();
      
      console.log(`Found ${paymentsSnapshot.docs.length} payments for this booking:`);
      paymentsSnapshot.docs.forEach(paymentDoc => {
        console.log(`Payment ${paymentDoc.id}:`, JSON.stringify(paymentDoc.data(), null, 2));
      });
      
    } else {
      console.log('❌ Booking not found in branch subcollection');
      
      // Try to find it in the main bookings collection
      console.log('Searching in main bookings collection...');
      const mainBookingDoc = await db.collection('bookings').doc(bookingId).get();
      
      if (mainBookingDoc.exists) {
        console.log('✅ Booking found in main bookings collection!');
        console.log('Booking data:', JSON.stringify(mainBookingDoc.data(), null, 2));
      } else {
        console.log('❌ Booking not found anywhere');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
  } finally {
    admin.app().delete();
  }
}

fetchEVOBooking();