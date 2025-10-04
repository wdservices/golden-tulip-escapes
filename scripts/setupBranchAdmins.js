import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const auth = getAuth();
const db = getFirestore();

// Branch admin configuration based on the emails you provided
const BRANCH_ADMINS = [
  // EVERGREEN branch
  {
    email: 'reservations@rivotelinternational.com',
    branchId: 'evergreen',
    branchName: 'GOLDEN TULIP EVERGREEN',
    displayName: 'Evergreen Admin'
  },
  
  // GARDEN CITY branch
  {
    email: 'fom@rivotels.com',
    branchId: 'garden-city',
    branchName: 'GOLDEN TULIP GARDEN CITY',
    displayName: 'Garden City Admin'
  },
  
  // STADIUM ROAD branch
  {
    email: 'reservationsgt@rivotels.com',
    branchId: 'stadium-31',
    branchName: 'GOLDEN TULIP STADIUM ROAD',
    displayName: 'Stadium Road Admin'
  },
  
  // EVO ROAD branch (already functional as you mentioned)
  {
    email: 'evoroad1@gmail.com',
    branchId: 'evo-road',
    branchName: 'GOLDEN TULIP EVO ROAD',
    displayName: 'Evo Road Admin 1'
  },
  {
    email: 'evoroad2@gmail.com',
    branchId: 'evo-road',
    branchName: 'GOLDEN TULIP EVO ROAD',
    displayName: 'Evo Road Admin 2'
  }
];

async function setupBranchAdmins() {
  console.log('Setting up branch admin users...');
  
  for (const adminConfig of BRANCH_ADMINS) {
    try {
      console.log(`Processing ${adminConfig.email} for ${adminConfig.branchName}...`);
      
      // Check if user exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(adminConfig.email);
        console.log(`User ${adminConfig.email} already exists`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await auth.createUser({
            email: adminConfig.email,
            emailVerified: true,
            displayName: adminConfig.displayName,
            password: 'TempPassword123!' // Temporary password - should be changed on first login
          });
          console.log(`Created user ${adminConfig.email}`);
        } else {
          throw error;
        }
      }
      
      // Set custom claims for branch admin
      const customClaims = {
        role: 'branch-admin',
        branchIds: [adminConfig.branchId]
      };
      
      await auth.setCustomUserClaims(userRecord.uid, customClaims);
      console.log(`Set branch admin claims for ${adminConfig.email} - branch: ${adminConfig.branchId}`);
      
      // Create admin user document in Firestore
      const adminDocRef = db.collection('adminUsers').doc(userRecord.uid);
      await adminDocRef.set({
        email: adminConfig.email,
        name: adminConfig.displayName,
        phone: '',
        branchId: adminConfig.branchId,
        branchIds: [adminConfig.branchId],
        role: 'branch-admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      console.log(`Created admin user document for ${adminConfig.email}`);
      
    } catch (error) {
      console.error(`Error setting up admin ${adminConfig.email}:`, error);
    }
  }
  
  console.log('Branch admin setup completed!');
  console.log('\nNext steps:');
  console.log('1. Share the temporary passwords with the branch admins');
  console.log('2. Ask them to change their passwords on first login');
  console.log('3. Test branch admin access by logging in with these accounts');
}

// Run the setup
setupBranchAdmins().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});