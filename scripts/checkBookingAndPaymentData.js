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

async function checkBookingAndPaymentData() {
  try {
    console.log('🔍 Checking booking and payment data structure...');
    console.log('==============================================');
    
    const stadiumBranchId = 'UShvwSYpMNpuNaS32MxZ';
    const bookingId = 'OPpqu5BJX34o9YTTud5F';
    
    console.log(`1️⃣ Checking booking: ${bookingId}`);
    
    // Get the booking data
    const bookingDoc = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .doc(bookingId)
      .get();
    
    if (bookingDoc.exists) {
      const bookingData = bookingDoc.data();
      console.log('Booking Data:');
      console.log(`   Guest Name: ${bookingData.guestName || 'N/A'}`);
      console.log(`   Customer Email: ${bookingData.customerEmail || 'N/A'}`);
      console.log(`   Customer ID: ${bookingData.customerId || 'N/A'}`);
      console.log(`   User ID: ${bookingData.userId || 'N/A'}`);
      console.log(`   Status: ${bookingData.status || 'N/A'}`);
      console.log(`   Check-in: ${bookingData.checkIn || 'N/A'}`);
      console.log(`   Check-out: ${bookingData.checkOut || 'N/A'}`);
      
      // Check if there's customer data in the booking
      if (bookingData.customer) {
        console.log('   Customer object:', JSON.stringify(bookingData.customer, null, 2));
      }
    } else {
      console.log('❌ Booking not found');
      return;
    }
    
    console.log('\n2️⃣ Checking payment data for this booking...');
    
    // Get payments for this booking
    const paymentsSnapshot = await db
      .collection('branches')
      .doc(stadiumBranchId)
      .collection('bookings')
      .doc(bookingId)
      .collection('payments')
      .get();
    
    console.log(`Found ${paymentsSnapshot.size} payments`);
    
    paymentsSnapshot.forEach(paymentDoc => {
      const paymentData = paymentDoc.data();
      console.log(`\nPayment ${paymentDoc.id}:`);
      console.log(`   Amount: ${paymentData.amount}`);
      console.log(`   Status: ${paymentData.status}`);
      console.log(`   Customer data: ${JSON.stringify(paymentData.customer || {}, null, 2)}`);
      console.log(`   Has customer object: ${!!paymentData.customer}`);
      console.log(`   Has customer_name: ${!!paymentData.customer?.customer_name}`);
      console.log(`   Has name: ${!!paymentData.customer?.name}`);
    });
    
    console.log('\n3️⃣ Checking if we can get customer data from user collection...');
    
    const bookingData = bookingDoc.data();
    if (bookingData.userId) {
      const userDoc = await db.collection('users').doc(bookingData.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('User Data:');
        console.log(`   Name: ${userData.name || 'N/A'}`);
        console.log(`   Email: ${userData.email || 'N/A'}`);
        console.log(`   Phone: ${userData.phone || 'N/A'}`);
      } else {
        console.log('❌ User not found');
      }
    } else {
      console.log('❌ No userId in booking');
    }
    
    console.log('\n✅ Analysis complete!');
    console.log('The guest name should be fetched from:');
    console.log('- booking.guestName (if available)');
    console.log('- booking.customer.name (if available)');
    console.log('- user.name (from users collection using booking.userId)');
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkBookingAndPaymentData().then(() => {
  console.log('Check completed');
  process.exit(0);
}).catch(error => {
  console.error('Check failed:', error);
  process.exit(1);
});