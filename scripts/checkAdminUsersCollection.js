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

async function checkAdminUsersCollection() {
  try {
    console.log('🔍 Checking adminUsers collection...');
    
    // Check adminUsers collection
    const adminUsersSnapshot = await db.collection('adminUsers').get();
    console.log(`📊 Found ${adminUsersSnapshot.size} admin users in adminUsers collection`);
    
    if (!adminUsersSnapshot.empty) {
      console.log('\n📋 Admin users in adminUsers collection:');
      adminUsersSnapshot.forEach(doc => {
        const admin = doc.data();
        console.log(`   ID: ${doc.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Branch ID: ${admin.branchId}`);
        console.log(`   Branch IDs: ${admin.branchIds?.join(', ') || 'None'}`);
        console.log(`   Is Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('   ---');
      });
    }
    
    // Check if hello.goldentulip@gmail.com is in adminUsers
    console.log('\n🎯 Checking specific admin email: hello.goldentulip@gmail.com');
    const adminQuery = await db
      .collection('adminUsers')
      .where('email', '==', 'hello.goldentulip@gmail.com')
      .get();
    
    if (!adminQuery.empty) {
      console.log('✅ hello.goldentulip@gmail.com found in adminUsers collection');
      adminQuery.forEach(doc => {
        const admin = doc.data();
        console.log(`   Role: ${admin.role}`);
        console.log(`   Branch: ${admin.branchId}`);
        console.log(`   Is Active: ${admin.isActive}`);
      });
    } else {
      console.log('❌ hello.goldentulip@gmail.com NOT found in adminUsers collection');
      
      // Check if this user exists in regular users collection
      console.log('\n🔍 Checking if hello.goldentulip@gmail.com exists in users collection...');
      const userQuery = await db
        .collection('users')
        .where('email', '==', 'hello.goldentulip@gmail.com')
        .get();
      
      if (!userQuery.empty) {
        console.log('✅ User found in users collection:');
        userQuery.forEach(doc => {
          const user = doc.data();
          console.log(`   ID: ${doc.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Role: ${user.role}`);
        });
        
        // Check if we should promote this user to admin
        console.log('\n💡 Suggestion: This user should be promoted to admin based on the ADMIN_EMAILS configuration');
        
      } else {
        console.log('❌ User not found in users collection either');
      }
    }
    
    // Check all users with email ending in @goldentulip.com or @rivotels.com
    console.log('\n🏢 Checking for potential admin users based on email domain...');
    const potentialAdmins = [];
    
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.email && (user.email.endsWith('@goldentulip.com') || user.email.endsWith('@rivotels.com'))) {
        potentialAdmins.push({ id: doc.id, ...user });
      }
    });
    
    console.log(`Found ${potentialAdmins.length} potential admin users based on email domain:`);
    potentialAdmins.forEach(user => {
      console.log(`   ${user.email} (${user.name}) - Current role: ${user.role || 'undefined'}`);
    });
    
    // Check EVO Road branch specific admin
    console.log('\n🎯 Checking EVO Road branch specific admin...');
    const evoBranchId = 'URcvGkmbfrOFInlOS4I9';
    const evoAdminQuery = await db
      .collection('adminUsers')
      .where('branchId', '==', evoBranchId)
      .get();
    
    console.log(`Found ${evoAdminQuery.size} admins for EVO Road branch`);
    evoAdminQuery.forEach(doc => {
      const admin = doc.data();
      console.log(`   ${admin.email} (${admin.name}) - Role: ${admin.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking admin users collection:', error);
  }
}

checkAdminUsersCollection().then(() => {
  console.log('\n✅ Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});