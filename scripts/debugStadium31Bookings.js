import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, orderBy, limit, where, collectionGroup } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzQ5XJ2F9J2F9J2F9J2F9J2F9J2F9J2F9",
  authDomain: "golden-tulip-port-harcourt.firebaseapp.com",
  projectId: "golden-tulip-port-harcourt",
  storageBucket: "golden-tulip-port-harcourt.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugStadium31Bookings() {
  try {
    console.log('🔍 Debugging Stadium Road 31 Bookings...');
    console.log('==========================================');
    
    const branchId = 'stadium-31';
    
    // 1. Check if branch exists
    console.log('\n1. Checking branch existence...');
    const branchesRef = collection(db, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);
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
    const bookingsRef = collection(db, 'branches', branchId, 'bookings');
    const bookingsQuery = query(bookingsRef, orderBy('bookingDate', 'desc'), limit(10));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
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
    const paymentsRef = collection(db, 'branches', branchId, 'payments');
    const paymentsQuery = query(paymentsRef, orderBy('createdAt', 'desc'), limit(10));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
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
      const globalBookingsRef = collection(db, 'bookings');
      const globalBookingsSnapshot = await getDocs(query(globalBookingsRef, limit(5)));
      console.log(`Global bookings collection: ${globalBookingsSnapshot.size} documents`);
      
      const globalPaymentsRef = collection(db, 'payments');
      const globalPaymentsSnapshot = await getDocs(query(globalPaymentsRef, limit(5)));
      console.log(`Global payments collection: ${globalPaymentsSnapshot.size} documents`);
    } catch (error) {
      console.log('No global bookings/payments collections found');
    }
    
    // 5. Check collection group query
    console.log('\n5. Testing collection group query...');
    try {
      const collectionGroupQuery = query(collectionGroup(db, 'bookings'), limit(5));
      const collectionGroupSnapshot = await getDocs(collectionGroupQuery);
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