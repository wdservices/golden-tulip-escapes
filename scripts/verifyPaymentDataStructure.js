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

async function verifyPaymentDataStructure() {
  try {
    console.log('🔍 Verifying payment data structure for Stadium Road 31...');
    console.log('=====================================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    
    // Get the booking we found earlier
    const bookingId = 'OPpqu5BJX34o9YTTud5F';
    
    console.log(`Checking booking: ${bookingId}`);
    
    // Get payments for this booking
    const paymentsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .doc(bookingId)
      .collection('payments')
      .get();
    
    console.log(`Found ${paymentsSnapshot.size} payments in booking subcollection`);
    
    paymentsSnapshot.forEach(paymentDoc => {
      const paymentData = paymentDoc.data();
      console.log(`\nPayment ID: ${paymentDoc.id}`);
      console.log(`Amount: ${paymentData.amount}`);
      console.log(`Status: ${paymentData.status}`);
      console.log(`Method: ${paymentData.paymentMethod}`);
      console.log(`Branch ID: ${paymentData.branchId}`);
      console.log(`Created At: ${JSON.stringify(paymentData.createdAt)}`);
      console.log(`Created At (converted): ${paymentData.createdAt ? new Date(paymentData.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      
      // Check if all required fields for the UI are present
      const requiredFields = ['amount', 'status', 'paymentMethod', 'createdAt', 'branchId'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      
      if (missingFields.length > 0) {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields present');
      }
    });
    
    console.log('\n✅ Payment data structure verification complete!');
    console.log('The payment data should now display correctly on the payment page.');
    
  } catch (error) {
    console.error('❌ Error verifying payment data:', error);
  }
}

verifyPaymentDataStructure().then(() => {
  console.log('Verification completed');
  process.exit(0);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});