import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function setupEVOAdminAccess() {
  try {
    console.log('🔧 Setting up admin access for EVO Road branch...');
    
    // EVO Road branch ID where the booking was made
    const evoBranchId = 'URcvGkmbfrOFInlOS4I9';
    
    // Admin email to set up (you can change this to your preferred admin email)
    const adminEmail = 'hello.goldentulip@gmail.com';
    
    console.log(`\n👤 Setting up admin access for: ${adminEmail}`);
    console.log(`🏢 Branch: EVO Road (${evoBranchId})`);
    
    // Step 1: Create admin email configuration in Firestore
    console.log('\n📧 Setting up admin email configuration...');
    
    const adminEmailId = adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const adminEmailRef = db.collection('adminEmails').doc(adminEmailId);
    
    await adminEmailRef.set({
      email: adminEmail.toLowerCase(),
      branchId: evoBranchId,
      role: 'branch-admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Admin email configuration created');
    
    // Step 2: Check if user exists and update their role
    console.log('\n👥 Checking user account...');
    
    const userQuery = await db
      .collection('users')
      .where('email', '==', adminEmail)
      .get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();
      
      console.log('✅ User found, updating role...');
      
      // Update user role
      await db.collection('users').doc(userDoc.id).update({
        role: 'branch-admin'
      });
      
      console.log('✅ User role updated to branch-admin');
      
      // Create admin user document
      const adminUserDoc = {
        email: userData.email,
        name: userData.name || 'EVO Road Admin',
        phone: userData.phone || '',
        branchId: evoBranchId,
        branchIds: [evoBranchId],
        role: 'branch-admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: userData.lastLogin || new Date().toISOString()
      };
      
      await db.collection('adminUsers').doc(userDoc.id).set(adminUserDoc);
      console.log('✅ Admin user document created');
      
    } else {
      console.log('⚠️ User not found. Please create a user account first with this email.');
    }
    
    // Step 3: Verify the booking exists
    console.log('\n📋 Verifying bookings in EVO Road branch...');
    
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(evoBranchId)
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`✅ Found ${bookingsSnapshot.size} bookings in EVO Road branch`);
    
    if (bookingsSnapshot.size > 0) {
      console.log('\n📊 Recent bookings:');
      bookingsSnapshot.forEach((doc, index) => {
        const booking = doc.data();
        console.log(`   ${index + 1}. ${booking.firstName} ${booking.lastName} - ${booking.roomType} (${booking.status})`);
      });
    }
    
    // Step 4: Verify branch document
    console.log('\n🏢 Verifying branch document...');
    const branchDoc = await db.collection('branches').doc(evoBranchId).get();
    
    if (branchDoc.exists) {
      const branchData = branchDoc.data();
      console.log('✅ Branch document exists:');
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
    } else {
      console.log('⚠️ Branch document not found, creating it...');
      
      await db.collection('branches').doc(evoBranchId).set({
        id: evoBranchId,
        name: 'GOLDEN TULIP EVO ROAD',
        location: 'Port Harcourt GRA',
        address: '1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State',
        phone: '+234 905 777 7780',
        email: 'reservations@goldentulipportharcourt.com',
        adminEmail: adminEmail,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Branch document created');
    }
    
    console.log('\n🎉 Admin access setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Admin email: ${adminEmail}`);
    console.log(`   ✅ Branch: EVO Road (${evoBranchId})`);
    console.log(`   ✅ Role: branch-admin`);
    console.log(`   ✅ Bookings accessible: ${bookingsSnapshot.size} found`);
    console.log('\n🚀 You can now log in with this email to access the Admin Dashboard!');
    
  } catch (error) {
    console.error('❌ Error setting up admin access:', error);
  }
}

setupEVOAdminAccess().then(() => {
  console.log('\n✅ Setup completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});