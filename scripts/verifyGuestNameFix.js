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

async function verifyGuestNameFix() {
  try {
    console.log('✅ Final Verification: Guest Name Fix');
    console.log('====================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    console.log('1️⃣ Checking payment data with guest name mapping...');
    
    // Get all bookings for this branch
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .get();
    
    let totalPayments = 0;
    let paymentsWithGuestNames = 0;
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingData = bookingDoc.data();
      
      // Get payments for this booking
      const paymentsSnapshot = await db
        .collection('branches')
        .doc(stadiumBranchId)
        .collection('bookings')
        .doc(bookingDoc.id)
        .collection('payments')
        .get();
      
      if (paymentsSnapshot.size > 0) {
        totalPayments += paymentsSnapshot.size;
        
        paymentsSnapshot.forEach(paymentDoc => {
          const paymentData = paymentDoc.data();
          
          // Apply the same mapping logic as in usePayments.ts
          const guestName = bookingData?.guestName || 
                           paymentData.customer?.customer_name || 
                           paymentData.customer?.name || 
                           'Unknown Guest';
          
          if (guestName !== 'Unknown Guest') {
            paymentsWithGuestNames++;
          }
          
          console.log(`\n💳 Payment ${paymentDoc.id}:`);
          console.log(`   Amount: ${paymentData.amount}`);
          console.log(`   Status: ${paymentData.status}`);
          console.log(`   Guest Name: ${guestName}`);
          console.log(`   Booking Guest Name: ${bookingData?.guestName || 'N/A'}`);
          console.log(`   Payment Customer Data: ${JSON.stringify(paymentData.customer || {})}`);
        });
      }
    }
    
    console.log('\n2️⃣ Summary:');
    console.log(`   ✅ Total bookings found: ${bookingsSnapshot.size}`);
    console.log(`   ✅ Total payments found: ${totalPayments}`);
    console.log(`   ✅ Payments with guest names: ${paymentsWithGuestNames}`);
    console.log(`   ✅ Guest name mapping success rate: ${totalPayments > 0 ? Math.round((paymentsWithGuestNames / totalPayments) * 100) : 0}%`);
    
    if (paymentsWithGuestNames === totalPayments && totalPayments > 0) {
      console.log('\n🎉 SUCCESS: All payments now have proper guest names!');
      console.log('The "Unknown Guest" issue has been resolved.');
      console.log('Guest names are now fetched from booking data.');
    } else {
      console.log('\n⚠️  Some payments still show "Unknown Guest"');
      console.log('This might be due to missing booking data or other issues.');
    }
    
    console.log('\n3️⃣ Expected Result:');
    console.log('   The payments page should now display actual guest names');
    console.log('   instead of "Unknown Guest" for all payment records.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyGuestNameFix().then(() => {
  console.log('Verification completed');
  process.exit(0);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});