import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Read service account key
const serviceAccount = JSON.parse(
  await readFile(new URL('../service-account.json', import.meta.url))
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugBranchMapping() {
  try {
    console.log('🔍 Debugging branch mapping and data structure...\n');
    
    // Check branch mappings
    const branchMappings = {
      "evo-road": {
        "databaseId": "URcvGkmbfrOFInlOS4I9",
        "staticId": "evo-road",
        "name": "GOLDEN TULIP EVO ROAD ",
        "location": "Port Harcourt, Nigeria"
      },
      "stadium-31": {
        "databaseId": "UShvwSYpMNpuNaS32MxZ", 
        "staticId": "stadium-31",
        "name": "GOLDEN TULIP 31 STADIUM RD.",
        "location": "Port Harcourt, Nigeria"
      }
    };
    
    console.log('📋 Branch Mappings:');
    Object.entries(branchMappings).forEach(([key, mapping]) => {
      console.log(`  ${key}: ${mapping.staticId} -> ${mapping.databaseId} (${mapping.name})`);
    });
    
    console.log('\n🔍 Checking EVO Road branch data...');
    
    // Check EVO Road branch
    const evoRoadId = 'URcvGkmbfrOFInlOS4I9';
    const evoBranchDoc = await db.collection('branches').doc(evoRoadId).get();
    
    if (evoBranchDoc.exists) {
      console.log('✅ EVO Road branch document exists');
      console.log('Branch data:', JSON.stringify(evoBranchDoc.data(), null, 2));
      
      // Check bookings in EVO Road
      const evoBookings = await db
        .collection('branches')
        .doc(evoRoadId)
        .collection('bookings')
        .limit(5)
        .get();
      
      console.log(`\n📊 Found ${evoBookings.docs.length} bookings in EVO Road branch:`);
      evoBookings.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - Booking ${doc.id}: ${data.guestName} (${data.status}) - ${data.branchName}`);
      });
      
      // Check payments in EVO Road
      const evoPayments = await db
        .collection('branches')
        .doc(evoRoadId)
        .collection('bookings')
        .doc('Pe3vOAoHimgKk1QHPVuG')
        .collection('payments')
        .get();
      
      console.log(`\n💳 Found ${evoPayments.docs.length} payments for booking Pe3vOAoHimgKk1QHPVuG:`);
      evoPayments.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - Payment ${doc.id}: ₦${data.amount} (${data.status}) - ${data.branchName}`);
      });
      
    } else {
      console.log('❌ EVO Road branch document not found');
    }
    
    // Check GT31 branch for comparison
    console.log('\n🔍 Checking GT31 branch data for comparison...');
    const gt31Id = 'UShvwSYpMNpuNaS32MxZ';
    const gt31BranchDoc = await db.collection('branches').doc(gt31Id).get();
    
    if (gt31BranchDoc.exists) {
      console.log('✅ GT31 branch document exists');
      
      const gt31Bookings = await db
        .collection('branches')
        .doc(gt31Id)
        .collection('bookings')
        .limit(3)
        .get();
      
      console.log(`Found ${gt31Bookings.docs.length} bookings in GT31 branch:`);
      gt31Bookings.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - Booking ${doc.id}: ${data.guestName} (${data.status}) - ${data.branchName}`);
      });
    } else {
      console.log('❌ GT31 branch document not found');
    }
    
    // Check if there are any bookings in main collection
    console.log('\n🔍 Checking main bookings collection...');
    const mainBookings = await db.collection('bookings').limit(3).get();
    console.log(`Found ${mainBookings.docs.length} bookings in main collection:`);
    mainBookings.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - Booking ${doc.id}: ${data.guestName} (${data.status}) - ${data.branchName}`);
    });
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    admin.app().delete();
  }
}

debugBranchMapping();