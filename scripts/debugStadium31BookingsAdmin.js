import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../service-account.json'), 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://golden-tulip-port-harcourt.firebaseio.com'
});

const db = getFirestore(app);

async function debugStadium31Bookings() {
  try {
    console.log('🔍 Debugging Stadium Road 31 Bookings...');
    console.log('==========================================');
    
    const branchId = 'UShvwSYpMNpuNaS32MxZ'; // Stadium Road 31 branch ID
    
    // 1. Check if branch exists
    console.log('\n1. Checking branch existence...');
    const branchesRef = db.collection('branches');
    const branchesSnapshot = await branchesRef.get();
    const branches = branchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Available branches:', branches.map(b => ({ id: b.id, name: b.name })));
    
    const stadiumBranch = branches.find(b => b.id === branchId);
    if (stadiumBranch) {
      console.log('✅ Stadium Road 31 branch found:', { id: stadiumBranch.id, name: stadiumBranch.name });
    } else {
      console.log('❌ Stadium Road 31 branch not found in main branches collection');
    }
    
    // 2. Fetch bookings from branch subcollection
    console.log('\n2. Fetching bookings from branch subcollection...');
    const bookingsRef = db.collection('branches').doc(branchId).collection('bookings');
    const bookingsSnapshot = await bookingsRef.orderBy('bookingDate', 'desc').limit(10).get();
    
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      bookingDate: doc.data().bookingDate?.toDate?.() || doc.data().bookingDate
    }));
    
    console.log(`Found ${bookings.length} bookings in Stadium Road 31:`);
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. Booking ID: ${booking.id}`);
      console.log(`     Guest: ${booking.guestName || 'N/A'}`);
      console.log(`     Email: ${booking.guestEmail || 'N/A'}`);
      console.log(`     Room: ${booking.roomNumber || booking.roomType || 'N/A'}`);
      console.log(`     Amount: ₦${booking.totalAmount || 0}`);
      console.log(`     Status: ${booking.status || 'N/A'}`);
      console.log(`     Date: ${booking.bookingDate}`);
      console.log(`     Check-in: ${booking.checkInDate?.toDate?.() || booking.checkInDate}`);
      console.log(`     Check-out: ${booking.checkOutDate?.toDate?.() || booking.checkOutDate}`);
      console.log('');
    });
    
    // 3. Fetch payments from branch subcollection
    console.log('\n3. Fetching payments from branch subcollection...');
    const paymentsRef = db.collection('branches').doc(branchId).collection('payments');
    const paymentsSnapshot = await paymentsRef.orderBy('createdAt', 'desc').limit(10).get();
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
    
    console.log(`Found ${payments.length} payments in Stadium Road 31:`);
    payments.forEach((payment, index) => {
      console.log(`  ${index + 1}. Payment ID: ${payment.id}`);
      console.log(`     Amount: ₦${payment.amount || 0}`);
      console.log(`     Status: ${payment.status || 'N/A'}`);
      console.log(`     Reference: ${payment.reference || 'N/A'}`);
      console.log(`     Booking ID: ${payment.bookingId || 'N/A'}`);
      console.log(`     Created: ${payment.createdAt}`);
      console.log('');
    });
    
    // 4. Check if there are any global bookings/payments collections
    console.log('\n4. Checking for global bookings collection...');
    try {
      const globalBookingsRef = db.collection('bookings');
      const globalBookingsSnapshot = await globalBookingsRef.limit(5).get();
      console.log(`Global bookings collection: ${globalBookingsSnapshot.size} documents`);
      
      const globalPaymentsRef = db.collection('payments');
      const globalPaymentsSnapshot = await globalPaymentsRef.limit(5).get();
      console.log(`Global payments collection: ${globalPaymentsSnapshot.size} documents`);
    } catch (error) {
      console.log('No global bookings/payments collections found');
    }
    
    // 5. Check collection group query
    console.log('\n5. Testing collection group query...');
    try {
      const collectionGroupSnapshot = await db.collectionGroup('bookings').limit(5).get();
      console.log(`Collection group query found: ${collectionGroupSnapshot.size} bookings across all branches`);
      
      const allBookings = collectionGroupSnapshot.docs.map(doc => ({
        id: doc.id,
        branchId: doc.ref.parent.parent?.id,
        ...doc.data()
      }));
      
      allBookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. Booking ID: ${booking.id}, Branch: ${booking.branchId}`);
      });
    } catch (error) {
      console.log('Collection group query failed:', error.message);
    }
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    console.error('Error details:', error.stack);
  }
}

// Run the debug function
debugStadium31Bookings().then(() => {
  console.log('Script completed');
}).catch(error => {
  console.error('Script failed:', error);
});