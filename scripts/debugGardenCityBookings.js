import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const db = getFirestore();
const auth = getAuth();

async function debugGardenCityBookings() {
  try {
    console.log('🔍 Debugging Garden City Branch Bookings...');
    console.log('============================================');
    
    const gardenCityBranchId = 'garden-city';
    
    // 1. Check if Garden City branch exists
    console.log('\n1. Checking Garden City branch existence...');
    const branchDoc = await db.collection('branches').doc(gardenCityBranchId).get();
    
    if (branchDoc.exists) {
      const branchData = branchDoc.data();
      console.log('✅ Garden City branch found:');
      console.log(`   ID: ${branchDoc.id}`);
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
      console.log(`   Admin Email: ${branchData.adminEmail || 'Not set'}`);
      console.log(`   Status: ${branchData.status || 'Not set'}`);
    } else {
      console.log('❌ Garden City branch document not found');
      
      // Check all available branches
      console.log('\n📋 Available branches:');
      const branchesSnapshot = await db.collection('branches').get();
      branchesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.name} (${data.location})`);
      });
    }
    
    // 2. Fetch bookings from Garden City branch subcollection
    console.log('\n2. Fetching bookings from Garden City branch subcollection...');
    const bookingsRef = db.collection('branches').doc(gardenCityBranchId).collection('bookings');
    const bookingsSnapshot = await bookingsRef.orderBy('createdAt', 'desc').limit(10).get();
    
    console.log(`📊 Total bookings in Garden City: ${bookingsSnapshot.size}`);
    
    if (bookingsSnapshot.size > 0) {
      console.log('\n📋 Recent bookings:');
      bookingsSnapshot.docs.forEach((doc, index) => {
        const booking = doc.data();
        console.log(`   ${index + 1}. Booking ID: ${doc.id}`);
        console.log(`      Guest: ${booking.guestName || 'N/A'}`);
        console.log(`      Email: ${booking.guestEmail || 'N/A'}`);
        console.log(`      Room: ${booking.roomType || 'N/A'}`);
        console.log(`      Status: ${booking.status || 'N/A'}`);
        console.log(`      Payment: ${booking.paymentStatus || 'N/A'}`);
        console.log(`      Branch ID: ${booking.branchId || 'N/A'}`);
        console.log(`      Branch Name: ${booking.branchName || 'N/A'}`);
        console.log(`      Created: ${booking.createdAt?.toDate?.() || booking.createdAt || 'N/A'}`);
        console.log(`      Check-in: ${booking.checkInDate?.toDate?.() || booking.checkInDate || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   No bookings found in Garden City branch');
    }
    
    // 3. Check Garden City admin users
    console.log('\n3. Checking Garden City admin users...');
    const gardenCityAdminEmail = 'fom@rivotels.com';
    
    try {
      const userRecord = await auth.getUserByEmail(gardenCityAdminEmail);
      console.log(`✅ Garden City admin user found: ${userRecord.email}`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
      
      // Check custom claims
      const customClaims = userRecord.customClaims || {};
      console.log(`   Role: ${customClaims.role || 'Not set'}`);
      console.log(`   Branch: ${customClaims.branch || 'Not set'}`);
      console.log(`   Admin: ${customClaims.admin || false}`);
    } catch (error) {
      console.log(`❌ Garden City admin user not found: ${error.message}`);
    }
    
    // 4. Check for any bookings with Garden City in the name/branch
    console.log('\n4. Searching for any Garden City related bookings across all branches...');
    const allBranchesSnapshot = await db.collection('branches').get();
    let totalGardenCityBookings = 0;
    
    for (const branchDoc of allBranchesSnapshot.docs) {
      const branchId = branchDoc.id;
      const branchData = branchDoc.data();
      
      try {
        const branchBookingsSnapshot = await db
          .collection('branches')
          .doc(branchId)
          .collection('bookings')
          .get();
        
        const gardenCityBookings = branchBookingsSnapshot.docs.filter(doc => {
          const booking = doc.data();
          return booking.branchId === 'garden-city' || 
                 booking.branchName?.toLowerCase().includes('garden city') ||
                 branchId === 'garden-city';
        });
        
        if (gardenCityBookings.length > 0) {
          console.log(`   Found ${gardenCityBookings.length} Garden City bookings in branch: ${branchId} (${branchData.name})`);
          totalGardenCityBookings += gardenCityBookings.length;
          
          gardenCityBookings.forEach(doc => {
            const booking = doc.data();
            console.log(`     - ${doc.id}: ${booking.guestName} (${booking.guestEmail})`);
          });
        }
      } catch (error) {
        console.log(`   Error checking bookings in branch ${branchId}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Total Garden City bookings found across all branches: ${totalGardenCityBookings}`);
    
    // 5. Test admin dashboard query simulation
    console.log('\n5. Simulating admin dashboard query for Garden City...');
    console.log('Frontend would execute:');
    console.log(`db.collection('branches').doc('${gardenCityBranchId}').collection('bookings').orderBy('checkInDate', 'desc')`);
    
    const adminQuerySnapshot = await db
      .collection('branches')
      .doc(gardenCityBranchId)
      .collection('bookings')
      .orderBy('checkInDate', 'desc')
      .get();
    
    console.log(`✅ Admin query result: ${adminQuerySnapshot.size} bookings`);
    
    if (adminQuerySnapshot.size > 0) {
      console.log('   Recent bookings visible to admin:');
      adminQuerySnapshot.docs.slice(0, 5).forEach((doc, index) => {
        const booking = doc.data();
        console.log(`     ${index + 1}. ${booking.guestName} - ${booking.roomType} (${booking.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the debug function
debugGardenCityBookings()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });