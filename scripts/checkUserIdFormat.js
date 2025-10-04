import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const db = getFirestore();

async function checkUserIdFormat() {
  try {
    console.log('🔍 Checking user ID format in bookings...');
    
    // Get all branches
    const branchesSnapshot = await db.collection('branches').get();
    
    for (const branchDoc of branchesSnapshot.docs) {
      const branchId = branchDoc.id;
      const branchData = branchDoc.data();
      
      console.log(`\n📍 Checking branch: ${branchData.name} (${branchId})`);
      
      // Get bookings for this branch
      const bookingsSnapshot = await db
        .collection('branches')
        .doc(branchId)
        .collection('bookings')
        .limit(5)
        .get();
      
      if (bookingsSnapshot.empty) {
        console.log('   No bookings found');
        continue;
      }
      
      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📅 Booking ${doc.id}:`);
        console.log(`      userId: "${data.userId}" (type: ${typeof data.userId})`);
        console.log(`      userEmail: "${data.userEmail || 'N/A'}"`);
        console.log(`      checkInDate: ${data.checkInDate}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserIdFormat();