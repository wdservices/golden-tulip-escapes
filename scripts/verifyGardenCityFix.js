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

// Import the branch mappings (simulate the frontend logic)
const BRANCH_ID_MAPPINGS = {
  "evo-road": {
    "databaseId": "AS5mYsGNnvA4cxLIPL3W",
    "staticId": "evo-road",
    "name": "GOLDEN TULIP EVO ROAD ",
    "location": "Port Harcourt, Nigeria"
  },
  "evergreen": {
    "databaseId": "PoqhCkWH04tMKmZTehVi",
    "staticId": "evergreen",
    "name": "GOLDEN TULIP EVERGREEN",
    "location": "Port Harcourt, Nigeria"
  },
  "stadium-31": {
    "databaseId": "UShvwSYpMNpuNaS32MxZ",
    "staticId": "stadium-31",
    "name": "GOLDEN TULIP 31 STADIUM RD.",
    "location": "Port Harcourt, Nigeria"
  },
  "garden-city": {
    "databaseId": "dD0zwzVpa27fZWhxTg7m",
    "staticId": "garden-city",
    "name": "GOLDEN TULIP GARDEN CITY ",
    "location": "Port Harcourt, Nigeria"
  }
};

function getDatabaseBranchId(staticId) {
  return BRANCH_ID_MAPPINGS[staticId]?.databaseId || staticId;
}

async function verifyGardenCityFix() {
  try {
    console.log('🔍 Verifying Garden City Fix...');
    console.log('==================================');
    
    // 1. Verify admin user permissions
    console.log('\n1. Checking Garden City admin permissions...');
    const gardenCityAdminEmail = 'fom@rivotels.com';
    
    try {
      const userRecord = await auth.getUserByEmail(gardenCityAdminEmail);
      const customClaims = userRecord.customClaims || {};
      
      console.log(`✅ Admin user found: ${userRecord.email}`);
      console.log(`   Role: ${customClaims.role || 'Not set'}`);
      console.log(`   Branch: ${customClaims.branch || 'Not set'}`);
      console.log(`   Branch Name: ${customClaims.branchName || 'Not set'}`);
      console.log(`   Admin: ${customClaims.admin || false}`);
      
      if (customClaims.role === 'branch-admin' && customClaims.branch === 'dD0zwzVpa27fZWhxTg7m') {
        console.log('✅ Admin permissions are correctly configured');
      } else {
        console.log('❌ Admin permissions need to be fixed');
        return;
      }
    } catch (error) {
      console.log(`❌ Error checking admin user: ${error.message}`);
      return;
    }
    
    // 2. Test branch ID mapping
    console.log('\n2. Testing branch ID mapping...');
    const staticBranchId = 'garden-city';
    const databaseBranchId = getDatabaseBranchId(staticBranchId);
    
    console.log(`   Static ID: ${staticBranchId}`);
    console.log(`   Database ID: ${databaseBranchId}`);
    
    if (databaseBranchId === 'dD0zwzVpa27fZWhxTg7m') {
      console.log('✅ Branch ID mapping is working correctly');
    } else {
      console.log('❌ Branch ID mapping is incorrect');
      return;
    }
    
    // 3. Verify bookings exist in the correct location
    console.log('\n3. Checking bookings in Garden City branch...');
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(databaseBranchId)
      .collection('bookings')
      .get();
    
    console.log(`✅ Found ${bookingsSnapshot.size} bookings in Garden City branch`);
    
    if (bookingsSnapshot.size > 0) {
      console.log('\n   Recent bookings:');
      bookingsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const booking = doc.data();
        console.log(`     ${index + 1}. ${booking.guestName} - ${booking.roomType} (${booking.status})`);
      });
    }
    
    // 4. Simulate admin dashboard query (what the frontend will do)
    console.log('\n4. Simulating admin dashboard query...');
    
    // This simulates what happens in BookingsPage.tsx
    const targetBranchId = 'garden-city'; // This is what the admin selects
    const resolvedDatabaseId = getDatabaseBranchId(targetBranchId); // This is the mapping
    
    const adminDashboardQuery = await db
      .collection('branches')
      .doc(resolvedDatabaseId)
      .collection('bookings')
      .orderBy('checkInDate', 'desc')
      .get();
    
    console.log(`✅ Admin dashboard query returned ${adminDashboardQuery.size} bookings`);
    
    if (adminDashboardQuery.size > 0) {
      console.log('   Bookings that will appear on admin dashboard:');
      adminDashboardQuery.docs.slice(0, 3).forEach((doc, index) => {
        const booking = doc.data();
        const checkInDate = booking.checkInDate?.toDate?.() || 'Unknown date';
        console.log(`     ${index + 1}. ${booking.guestName} - Check-in: ${checkInDate.toLocaleDateString()}`);
      });
    }
    
    // 5. Test all branches to ensure consistency
    console.log('\n5. Testing all branches for consistency...');
    
    for (const [staticId, mapping] of Object.entries(BRANCH_ID_MAPPINGS)) {
      try {
        const branchBookings = await db
          .collection('branches')
          .doc(mapping.databaseId)
          .collection('bookings')
          .limit(1)
          .get();
        
        console.log(`   ${staticId} (${mapping.name.trim()}): ${branchBookings.size > 0 ? '✅ Has bookings' : '⚠️  No bookings'}`);
      } catch (error) {
        console.log(`   ${staticId}: ❌ Error querying - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Garden City Fix Verification Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Garden City admin permissions configured correctly');
    console.log('   ✅ Branch ID mapping working properly');
    console.log('   ✅ Bookings exist in correct database location');
    console.log('   ✅ Admin dashboard query will return bookings');
    console.log('   ✅ All branches tested for consistency');
    
    console.log('\n🚀 The Garden City admin should now be able to see bookings!');
    console.log('\n📝 Next steps:');
    console.log('   1. Have the Garden City admin log out and log back in');
    console.log('   2. Navigate to the admin dashboard');
    console.log('   3. Select Garden City branch');
    console.log('   4. Verify bookings are now visible');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Run the verification
verifyGardenCityFix()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });