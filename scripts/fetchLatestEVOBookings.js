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

async function fetchLatestEVOBookings() {
  try {
    console.log('🔍 Fetching latest bookings for EVO Road branch...');
    
    // EVO Road branch ID from our test data
    const evoBranchId = 'AS5mYsGNnvA4cxLIPL3W';
    
    // Fetch all bookings from EVO Road branch
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(evoBranchId)
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`📊 Found ${bookingsSnapshot.size} bookings in EVO Road branch`);
    
    if (bookingsSnapshot.empty) {
      console.log('❌ No bookings found in EVO Road branch subcollection');
      return;
    }
    
    // Display booking details
    bookingsSnapshot.forEach((doc, index) => {
      const booking = doc.data();
      console.log(`\n🏨 Booking #${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Guest: ${booking.firstName} ${booking.lastName}`);
      console.log(`   Email: ${booking.email}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Room Type: ${booking.roomType}`);
      console.log(`   Check-in: ${booking.checkInDate?.toDate()?.toLocaleDateString()}`);
      console.log(`   Check-out: ${booking.checkOutDate?.toDate()?.toLocaleDateString()}`);
      console.log(`   Total Amount: ₦${booking.totalAmount}`);
      console.log(`   Branch: ${booking.branchName}`);
      console.log(`   Created: ${booking.createdAt?.toDate()?.toLocaleString()}`);
    });
    
    // Check if there's a branch admin for EVO Road
    console.log('\n👥 Checking branch admin configuration...');
    const branchDoc = await db.collection('branches').doc(evoBranchId).get();
    if (branchDoc.exists) {
      const branchData = branchDoc.data();
      console.log('✅ Branch document exists:');
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
      console.log(`   Admin Email: ${branchData.adminEmail || 'Not set'}`);
    }
    
    // Check admin users with branch claims
    console.log('\n🔐 Checking admin users with branch claims...');
    const adminUsersSnapshot = await db
      .collection('users')
      .where('role', 'in', ['branch-admin', 'hq-admin'])
      .get();
    
    console.log(`Found ${adminUsersSnapshot.size} admin users`);
    adminUsersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.branch === evoBranchId) {
        console.log(`✅ Branch admin found: ${user.email} (Branch: ${user.branch})`);
      }
    });
    
    // Test the query that the frontend uses
    console.log('\n🧪 Testing frontend query logic...');
    console.log('Frontend query would be:');
    console.log(`db.collection('branches').doc('${evoBranchId}').collection('bookings')`);
    
    // Simulate different user roles
    const testUsers = [
      { role: 'admin', branch: null, expected: 'Can see all branches' },
      { role: 'branch-admin', branch: evoBranchId, expected: 'Can see EVO Road only' },
      { role: 'branch-admin', branch: 'different-branch', expected: 'Cannot see EVO Road' }
    ];
    
    testUsers.forEach(user => {
      console.log(`\n🧪 Testing with ${user.role} ${user.branch ? `(branch: ${user.branch})` : '(no branch)'}`);
      
      let targetBranchId = null;
      if (user.role === 'branch-admin' && user.branch) {
        targetBranchId = user.branch;
      } else if (user.role === 'admin') {
        targetBranchId = evoBranchId; // Admin can select any branch
      }
      
      if (targetBranchId === evoBranchId) {
        console.log(`   ✅ User can access EVO Road bookings`);
      } else {
        console.log(`   ❌ User cannot access EVO Road bookings`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching EVO Road bookings:', error);
  }
}

fetchLatestEVOBookings().then(() => {
  console.log('\n✅ Fetch completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});