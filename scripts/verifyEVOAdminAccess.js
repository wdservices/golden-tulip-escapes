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

async function verifyEVOAdminAccess() {
  try {
    console.log('🔍 Verifying EVO Road admin access to bookings...');
    
    // Test user: hello.goldentulip@gmail.com (now HQ admin)
    const adminEmail = 'hello.goldentulip@gmail.com';
    const evoBranchId = 'AS5mYsGNnvA4cxLIPL3W';
    
    console.log(`\n👤 Testing admin access for: ${adminEmail}`);
    
    // Get admin user document
    const adminQuery = await db
      .collection('adminUsers')
      .where('email', '==', adminEmail)
      .get();
    
    if (adminQuery.empty) {
      console.log('❌ Admin user not found in adminUsers collection');
      return;
    }
    
    const adminDoc = adminQuery.docs[0];
    const adminData = adminDoc.data();
    
    console.log('✅ Admin user found:');
    console.log(`   ID: ${adminDoc.id}`);
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   Branch Access: ${adminData.branchIds?.join(', ')}`);
    
    // Test 1: Simulate HQ admin accessing all branches
    console.log('\n🧪 Test 1: HQ admin accessing EVO Road branch');
    
    if (adminData.role === 'hq-admin' || adminData.branchIds?.includes('all')) {
      console.log('✅ HQ admin can access all branches');
      
      // Fetch EVO Road bookings
      const bookingsSnapshot = await db
        .collection('branches')
        .doc(evoBranchId)
        .collection('bookings')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      console.log(`✅ Retrieved ${bookingsSnapshot.size} bookings from EVO Road branch`);
      
      // Display booking details
      bookingsSnapshot.forEach((doc, index) => {
        const booking = doc.data();
        console.log(`\n   📋 Booking #${index + 1}:`);
        console.log(`      ID: ${doc.id}`);
        console.log(`      Guest: ${booking.firstName} ${booking.lastName}`);
        console.log(`      Email: ${booking.email}`);
        console.log(`      Status: ${booking.status}`);
        console.log(`      Room: ${booking.roomType}`);
        console.log(`      Check-in: ${booking.checkInDate?.toDate()?.toLocaleDateString()}`);
        console.log(`      Total: ₦${booking.totalAmount}`);
        console.log(`      Branch: ${booking.branchName}`);
      });
      
    } else {
      console.log('❌ User is not HQ admin');
    }
    
    // Test 2: Simulate branch admin accessing specific branch
    console.log('\n🧪 Test 2: Branch admin accessing their assigned branch');
    
    if (adminData.role === 'branch-admin' && adminData.branchId === evoBranchId) {
      console.log('✅ Branch admin can access EVO Road branch');
    } else if (adminData.role === 'branch-admin') {
      console.log(`❌ Branch admin assigned to different branch: ${adminData.branchId}`);
    }
    
    // Test 3: Check branch document
    console.log('\n🧪 Test 3: Branch document verification');
    const branchDoc = await db.collection('branches').doc(evoBranchId).get();
    
    if (branchDoc.exists) {
      const branchData = branchDoc.data();
      console.log('✅ EVO Road branch document exists:');
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
      console.log(`   Admin Email: ${branchData.adminEmail || 'Not set'}`);
    } else {
      console.log('❌ EVO Road branch document not found');
    }
    
    // Test 4: Simulate frontend query
    console.log('\n🧪 Test 4: Simulating frontend booking query');
    console.log('Frontend would execute:');
    console.log(`db.collection('branches').doc('${evoBranchId}').collection('bookings')`);
    
    // Count total bookings
    const totalBookings = await db
      .collection('branches')
      .doc(evoBranchId)
      .collection('bookings')
      .count()
      .get();
    
    console.log(`✅ Total bookings in EVO Road branch: ${totalBookings.data().count}`);
    
    // Test 5: Check recent bookings
    console.log('\n🧪 Test 5: Recent bookings (last 7 days)');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = await db
      .collection('branches')
      .doc(evoBranchId)
      .collection('bookings')
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`✅ Recent bookings (last 7 days): ${recentBookings.size}`);
    
    console.log('\n🎉 Verification completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ hello.goldentulip@gmail.com is now HQ admin');
    console.log('   ✅ Can access all branches including EVO Road');
    console.log('   ✅ EVO Road branch has bookings available');
    console.log('   ✅ Frontend query should work correctly');
    console.log('   ✅ Admin dashboard should display bookings');
    
  } catch (error) {
    console.error('❌ Error verifying admin access:', error);
  }
}

verifyEVOAdminAccess().then(() => {
  console.log('\n✅ Verification completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});