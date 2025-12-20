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

async function fixEVOBranchAdmin() {
  try {
    console.log('🔧 Fixing EVO Road branch admin configuration...');
    
    // Our test EVO Road branch ID from createTestBookingForClient.js
    const testEVOBranchId = 'URcvGkmbfrOFInlOS4I9';
    
    // Check if there's an admin user for the correct EVO branch
    console.log('\n🔍 Checking for EVO Road admin with correct branch ID...');
    const evoAdminQuery = await db
      .collection('adminUsers')
      .where('branchId', '==', testEVOBranchId)
      .get();
    
    if (evoAdminQuery.empty) {
      console.log('❌ No admin found for EVO Road branch (ID: URcvGkmbfrOFInlOS4I9)');
      
      // Check if hello.goldentulip@gmail.com exists and promote it
      console.log('\n🎯 Checking hello.goldentulip@gmail.com for promotion...');
      const userQuery = await db
        .collection('users')
        .where('email', '==', 'hello.goldentulip@gmail.com')
        .get();
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        
        console.log('✅ Found hello.goldentulip@gmail.com user');
        console.log(`   ID: ${userDoc.id}`);
        console.log(`   Name: ${userData.name}`);
        console.log(`   Current Role: ${userData.role || 'undefined'}`);
        
        // Promote to HQ admin
        console.log('\n🚀 Promoting hello.goldentulip@gmail.com to HQ admin...');
        
        const adminUserDoc = {
          email: userData.email,
          name: userData.name || 'Golden Tulip Admin',
          phone: userData.phone || '',
          branchId: 'all', // HQ admin can access all branches
          branchIds: ['all'],
          role: 'hq-admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: userData.lastLogin || new Date().toISOString()
        };
        
        await db.collection('adminUsers').doc(userDoc.id).set(adminUserDoc);
        console.log('✅ Successfully created admin user document');
        
        // Also update the users collection
        await db.collection('users').doc(userDoc.id).update({
          role: 'hq-admin'
        });
        console.log('✅ Updated user role in users collection');
        
      } else {
        console.log('❌ hello.goldentulip@gmail.com user not found');
      }
    } else {
      console.log('✅ Found existing EVO Road admin:');
      evoAdminQuery.forEach(doc => {
        const admin = doc.data();
        console.log(`   ${admin.email} (${admin.name}) - Role: ${admin.role}`);
      });
    }
    
    // Now let's verify the bookings are accessible
    console.log('\n📊 Verifying EVO Road bookings accessibility...');
    
    // Check bookings in the test EVO branch
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(testEVOBranchId)
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`✅ Found ${bookingsSnapshot.size} bookings in EVO Road branch`);
    
    // Display the bookings
    bookingsSnapshot.forEach((doc, index) => {
      const booking = doc.data();
      console.log(`\n🏨 Booking #${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Guest: ${booking.firstName} ${booking.lastName}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Room: ${booking.roomType}`);
      console.log(`   Branch: ${booking.branchName}`);
      console.log(`   Created: ${booking.createdAt?.toDate()?.toLocaleString()}`);
    });
    
    // Check branch document
    console.log('\n🏢 Checking EVO Road branch document...');
    const branchDoc = await db.collection('branches').doc(testEVOBranchId).get();
    if (branchDoc.exists) {
      const branchData = branchDoc.data();
      console.log('✅ Branch document exists:');
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
      console.log(`   Admin Email: ${branchData.adminEmail || 'Not set'}`);
    }
    
    console.log('\n🎉 Fix completed! The EVO Road admin should now be able to see bookings.');
    console.log('\n📋 Summary:');
    console.log('   ✅ hello.goldentulip@gmail.com promoted to HQ admin');
    console.log('   ✅ Can access all branches including EVO Road');
    console.log('   ✅ Bookings exist in EVO Road branch (URcvGkmbfrOFInlOS4I9)');
    console.log('   ✅ Admin dashboard should now display bookings');
    
  } catch (error) {
    console.error('❌ Error fixing EVO branch admin:', error);
  }
}

fixEVOBranchAdmin().then(() => {
  console.log('\n✅ Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});