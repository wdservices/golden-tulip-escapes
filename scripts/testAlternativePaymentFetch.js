import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '../service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testAlternativePaymentFetch() {
  try {
    console.log('🔄 Testing alternative payment fetch method...');
    console.log('=====================================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    console.log(`Fetching payments for branch: ${stadiumBranchId}`);
    
    // Alternative approach: Fetch payments from branch subcollections directly
    const payments = [];
    
    // Get all bookings for this branch
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .get();
    
    console.log(`Found ${bookingsSnapshot.size} bookings`);
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingId = bookingDoc.id;
      
      // Get payments for this booking
      const paymentsSnapshot = await db
        .collection('branches')
        .doc(stadiumBranchId)
        .collection('bookings')
        .doc(bookingId)
        .collection('payments')
        .orderBy('createdAt', 'desc')
        .get();
      
      paymentsSnapshot.forEach(paymentDoc => {
        const paymentData = paymentDoc.data();
        payments.push({
          id: paymentDoc.id,
          bookingId: bookingId,
          branchId: stadiumBranchId,
          ...paymentData
        });
      });
    }
    
    console.log(`\n✅ Found ${payments.length} payments using alternative method`);
    
    if (payments.length > 0) {
      console.log('\nSample payment data:');
      console.log(JSON.stringify(payments[0], null, 2));
    }
    
    console.log('\n🎯 This alternative method can be used as a fallback');
    console.log('   when the collection group query fails due to missing index');
    
  } catch (error) {
    console.error('❌ Error testing alternative method:', error);
  }
}

testAlternativePaymentFetch().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});