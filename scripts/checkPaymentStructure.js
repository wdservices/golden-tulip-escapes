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

async function checkPaymentStructure() {
  try {
    console.log('🔍 Checking payment data structure...');
    console.log('==========================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    // Get the booking and payment we found
    const bookingId = 'OPpqu5BJX34o9YTTud5F';
    const paymentId = 'C38o23m3sugyuO5TEFv6';
    
    console.log(`\n📋 Examining payment ${paymentId} for booking ${bookingId}`);
    
    const paymentDoc = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .doc(bookingId)
      .collection('payments')
      .doc(paymentId)
      .get();
    
    if (paymentDoc.exists) {
      const paymentData = paymentDoc.data();
      console.log('\nPayment data structure:');
      console.log(JSON.stringify(paymentData, null, 2));
      
      console.log('\n🔍 Key fields analysis:');
      console.log(`- Has branchId field: ${paymentData.branchId ? 'YES' : 'NO'}`);
      console.log(`- branchId value: ${paymentData.branchId || 'undefined'}`);
      console.log(`- Has bookingId field: ${paymentData.bookingId ? 'YES' : 'NO'}`);
      console.log(`- bookingId value: ${paymentData.bookingId || 'undefined'}`);
      console.log(`- Has createdAt field: ${paymentData.createdAt ? 'YES' : 'NO'}`);
      console.log(`- createdAt type: ${typeof paymentData.createdAt}`);
      
      // Check the booking to see if we can get branch info from there
      console.log('\n📋 Examining booking data:');
      const bookingDoc = await db
        .collection('branches')
        .doc(stadiumBranchId)
        .collection('bookings')
        .doc(bookingId)
        .get();
      
      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        console.log('Booking data structure:');
        console.log(JSON.stringify(bookingData, null, 2));
        
        console.log('\n🔍 Booking key fields:');
        console.log(`- Has branchId field: ${bookingData.branchId ? 'YES' : 'NO'}`);
        console.log(`- branchId value: ${bookingData.branchId || 'undefined'}`);
      }
      
      // Check if we can fix the payment by adding branchId
      console.log('\n💡 SOLUTION: Adding branchId to payment...');
      await paymentDoc.ref.update({
        branchId: stadiumBranchId,
        updatedAt: new Date()
      });
      
      console.log('✅ Added branchId field to payment');
      
    } else {
      console.log('❌ Payment document not found');
    }
    
    console.log('\n✅ Payment structure analysis completed!');
    
  } catch (error) {
    console.error('❌ Error checking payment structure:', error);
  }
}

checkPaymentStructure().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});