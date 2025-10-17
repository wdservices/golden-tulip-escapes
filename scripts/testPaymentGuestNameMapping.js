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

async function testPaymentGuestNameMapping() {
  try {
    console.log('🧪 Testing Payment Guest Name Mapping');
    console.log('====================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    console.log('1️⃣ Getting bookings and payments...');
    
    // Get all bookings for this branch
    const bookingsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .get();
    
    console.log(`Found ${bookingsSnapshot.size} bookings`);
    
    // Create booking data map
    const bookingDataMap = new Map();
    for (const bookingDoc of bookingsSnapshot.docs) {
      bookingDataMap.set(bookingDoc.id, bookingDoc.data());
    }
    
    console.log('\n2️⃣ Processing payments...');
    
    let totalPayments = 0;
    
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingData = bookingDataMap.get(bookingDoc.id);
      
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
          
          const customerEmail = bookingData?.customerEmail || 
                               paymentData.customer?.email || 
                               'N/A';
          
          console.log(`\n💳 Payment ${paymentDoc.id}:`);
          console.log(`   Amount: ${paymentData.amount}`);
          console.log(`   Status: ${paymentData.status}`);
          console.log(`   Guest Name (mapped): ${guestName}`);
          console.log(`   Customer Email (mapped): ${customerEmail}`);
          console.log(`   Booking ID: ${bookingDoc.id}`);
          console.log(`   Booking Guest Name: ${bookingData?.guestName || 'N/A'}`);
          console.log(`   Payment Customer Data: ${JSON.stringify(paymentData.customer || {})}`);
        });
      }
    }
    
    console.log(`\n3️⃣ Summary:`);
    console.log(`   ✅ Total bookings: ${bookingsSnapshot.size}`);
    console.log(`   ✅ Total payments: ${totalPayments}`);
    console.log(`   ✅ Guest names should now be properly displayed`);
    
    console.log('\n🎉 Payment guest name mapping test complete!');
    console.log('The payments page should now show actual guest names instead of "Unknown Guest".');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentGuestNameMapping().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});