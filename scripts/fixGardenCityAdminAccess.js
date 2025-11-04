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

async function fixGardenCityAdminAccess() {
  try {
    console.log('🔧 Fixing Garden City Admin Access...');
    console.log('====================================');
    
    // 1. Get the correct Garden City branch ID from database
    console.log('\n1. Finding correct Garden City branch ID...');
    const branchesSnapshot = await db.collection('branches').get();
    let gardenCityBranchId = null;
    let gardenCityBranchData = null;
    
    branchesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase().includes('garden city')) {
        gardenCityBranchId = doc.id;
        gardenCityBranchData = data;
        console.log(`✅ Found Garden City branch: ${doc.id} - ${data.name}`);
      }
    });
    
    if (!gardenCityBranchId) {
      console.log('❌ Garden City branch not found in database');
      return;
    }
    
    // 2. Update Garden City admin user's custom claims
    console.log('\n2. Updating Garden City admin user permissions...');
    const gardenCityAdminEmail = 'fom@rivotels.com';
    
    try {
      const userRecord = await auth.getUserByEmail(gardenCityAdminEmail);
      console.log(`✅ Found admin user: ${userRecord.email}`);
      
      // Set custom claims with correct branch ID
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'branch-admin',
        branch: gardenCityBranchId,
        admin: true,
        branchName: gardenCityBranchData.name
      });
      
      console.log(`✅ Updated custom claims for ${userRecord.email}:`);
      console.log(`   Role: branch-admin`);
      console.log(`   Branch: ${gardenCityBranchId}`);
      console.log(`   Branch Name: ${gardenCityBranchData.name}`);
      console.log(`   Admin: true`);
      
    } catch (error) {
      console.log(`❌ Error updating admin user: ${error.message}`);
    }
    
    // 3. Update branch document with admin email
    console.log('\n3. Updating branch document with admin email...');
    await db.collection('branches').doc(gardenCityBranchId).update({
      adminEmail: gardenCityAdminEmail,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Updated branch document with admin email`);
    
    // 4. Create branch ID mapping for frontend
    console.log('\n4. Creating branch ID mapping...');
    const branchMappings = {};
    
    branchesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      let staticId = null;
      
      // Map database IDs to static IDs used in frontend
      if (data.name && data.name.toLowerCase().includes('garden city')) {
        staticId = 'garden-city';
      } else if (data.name && data.name.toLowerCase().includes('evo road')) {
        staticId = 'evo-road';
      } else if (data.name && data.name.toLowerCase().includes('evergreen')) {
        staticId = 'evergreen';
      } else if (data.name && data.name.toLowerCase().includes('stadium')) {
        staticId = 'stadium-31';
      }
      
      if (staticId) {
        branchMappings[staticId] = {
          databaseId: doc.id,
          staticId: staticId,
          name: data.name,
          location: data.location
        };
        console.log(`   ${staticId} -> ${doc.id} (${data.name})`);
      }
    });
    
    // 5. Save branch mappings to a config file
    console.log('\n5. Saving branch mappings...');
    const mappingContent = `// Auto-generated branch ID mappings
export const BRANCH_ID_MAPPINGS = ${JSON.stringify(branchMappings, null, 2)};

// Helper function to get database ID from static ID
export function getDatabaseBranchId(staticId: string): string {
  return BRANCH_ID_MAPPINGS[staticId]?.databaseId || staticId;
}

// Helper function to get static ID from database ID
export function getStaticBranchId(databaseId: string): string {
  const mapping = Object.values(BRANCH_ID_MAPPINGS).find(m => m.databaseId === databaseId);
  return mapping?.staticId || databaseId;
}
`;
    
    const fs = await import('fs');
    fs.writeFileSync('./src/config/branchMappings.ts', mappingContent);
    console.log('✅ Branch mappings saved to src/config/branchMappings.ts');
    
    // 6. Verify the fix
    console.log('\n6. Verifying the fix...');
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(gardenCityBranchId)
      .collection('bookings')
      .get();
    
    console.log(`✅ Garden City branch (${gardenCityBranchId}) has ${bookingsSnapshot.size} bookings`);
    
    if (bookingsSnapshot.size > 0) {
      console.log('   Recent bookings:');
      bookingsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const booking = doc.data();
        console.log(`     ${index + 1}. ${booking.guestName} - ${booking.roomType}`);
      });
    }
    
    console.log('\n✅ Garden City admin access has been fixed!');
    console.log('\nNext steps:');
    console.log('1. Update the frontend to use the branch mappings');
    console.log('2. Test admin login for Garden City branch');
    console.log('3. Verify bookings are visible in admin dashboard');
    
  } catch (error) {
    console.error('❌ Error fixing Garden City admin access:', error);
  }
}

// Run the fix function
fixGardenCityAdminAccess()
  .then(() => {
    console.log('\n✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });