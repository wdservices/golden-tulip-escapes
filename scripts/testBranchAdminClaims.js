import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const auth = getAuth();

// Test branch admin emails (updated with your new addresses)
const TEST_EMAILS = [
  'reservations@rivotelinternational.com', // EVERGREEN
  'fom@rivotels.com', // GARDEN CITY
  'reservationsgt@rivotels.com', // STADIUM ROAD
  'evoroad1@gmail.com' // EVO ROAD (already functional)
];

async function testBranchAdminClaims() {
  console.log('Testing branch admin claims...\n');
  
  for (const email of TEST_EMAILS) {
    try {
      console.log(`Testing ${email}...`);
      
      // Get user by email
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user's custom claims
      const customClaims = userRecord.customClaims || {};
      
      console.log(`  UID: ${userRecord.uid}`);
      console.log(`  Display Name: ${userRecord.displayName}`);
      console.log(`  Custom Claims:`, customClaims);
      
      // Verify claims structure
      if (customClaims.role === 'branch-admin') {
        console.log(`  ✓ Role is correctly set to 'branch-admin'`);
      } else {
        console.log(`  ✗ Role is ${customClaims.role}, expected 'branch-admin'`);
      }
      
      if (Array.isArray(customClaims.branchIds)) {
        console.log(`  ✓ Branch IDs array:`, customClaims.branchIds);
      } else {
        console.log(`  ✗ Branch IDs not found or not an array`);
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.error(`Error testing ${email}:`, error.message);
      console.log('');
    }
  }
  
  console.log('Branch admin claims test completed!');
}

// Run the test
testBranchAdminClaims().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});