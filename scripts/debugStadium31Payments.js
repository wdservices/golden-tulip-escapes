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

async function debugStadium31Payments() {
  try {
    console.log('🔍 Debugging Stadium Road 31 Payments...');
    console.log('==========================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    // 1. Check payments in branch subcollections
    console.log('\n1. Checking payments in branch subcollections...');
    
    // Get all bookings for Stadium Road 31
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .get();
    
    console.log(`Found ${bookingsSnapshot.size} bookings in Stadium Road 31`);
    
    let totalPayments = 0;
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingId = bookingDoc.id;
      
      // Check payments subcollection for each booking
      const paymentsSnapshot = await db
        .collection('branches')
        .doc(stadiumBranchId)
        .collection('bookings')
        .doc(bookingId)
        .collection('payments')
        .get();
      
      if (paymentsSnapshot.size > 0) {
        console.log(`\n  Booking ${bookingId} has ${paymentsSnapshot.size} payments:`);
        paymentsSnapshot.forEach(paymentDoc => {
          const payment = paymentDoc.data();
          totalPayments++;
          console.log(`    - Payment ID: ${paymentDoc.id}`);
          console.log(`      Amount: ${payment.amount}`);
          console.log(`      Status: ${payment.status}`);
          console.log(`      Method: ${payment.method}`);
          console.log(`      Created: ${payment.createdAt?.toDate()}`);
          console.log('');
        });
      }
    }
    
    console.log(`\nTotal payments found in branch subcollections: ${totalPayments}`);
    
    // 2. Check collection group query for payments
    console.log('\n2. Testing collection group query for payments...');
    
    try {
      const paymentsQuery = db.collectionGroup('payments');
      const paymentsSnapshot = await paymentsQuery
        .where('branchId', '==', stadiumBranchId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      console.log(`Collection group query found ${paymentsSnapshot.size} payments for Stadium Road 31`);
      
      if (paymentsSnapshot.size > 0) {
        paymentsSnapshot.forEach(paymentDoc => {
          const payment = paymentDoc.data();
          console.log(`  - Payment ID: ${paymentDoc.id}`);
          console.log(`    Amount: ${payment.amount}`);
          console.log(`    Status: ${payment.status}`);
          console.log(`    Booking ID: ${payment.bookingId}`);
          console.log(`    Created: ${payment.createdAt?.toDate()}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('Collection group query failed (likely missing index)');
      console.log('Error:', error.message);
    }
    
    // 3. Check if there are any payments at all
    console.log('\n3. Checking for any payments across all branches...');
    
    try {
      const allPaymentsSnapshot = await db.collectionGroup('payments').limit(10).get();
      console.log(`Found ${allPaymentsSnapshot.size} total payments across all branches`);
      
      if (allPaymentsSnapshot.size > 0) {
        allPaymentsSnapshot.forEach(paymentDoc => {
          const payment = paymentDoc.data();
          console.log(`  - Payment from branch: ${payment.branchId || 'unknown'}`);
          console.log(`    Amount: ${payment.amount}`);
          console.log(`    Status: ${payment.status}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('Failed to query all payments:', error.message);
    }
    
    console.log('\n✅ Payment debug completed!');
    
  } catch (error) {
    console.error('❌ Error debugging payments:', error);
  }
}

debugStadium31Payments().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});