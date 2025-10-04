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

async function debugBookingIssue() {
  try {
    console.log('🔍 Debugging booking issue...');
    
    // Check all branches
    console.log('\n📂 Checking all branches:');
    const branchesSnapshot = await db.collection('branches').get();
    
    for (const branchDoc of branchesSnapshot.docs) {
      console.log(`\n🏢 Branch: ${branchDoc.id}`);
      const branchData = branchDoc.data();
      console.log(`   Name: ${branchData.name || 'N/A'}`);
      
      // Check bookings in this branch
      const bookingsSnapshot = await db.collection('branches')
        .doc(branchDoc.id)
        .collection('bookings')
        .get();
      
      console.log(`   📋 Total bookings: ${bookingsSnapshot.size}`);
      
      if (bookingsSnapshot.size > 0) {
        bookingsSnapshot.forEach(bookingDoc => {
          const booking = bookingDoc.data();
          console.log(`     📅 Booking ID: ${bookingDoc.id}`);
          console.log(`        User ID: ${booking.userId}`);
          console.log(`        Email: ${booking.email}`);
          console.log(`        Branch: ${booking.branchName}`);
          console.log(`        Nights: ${booking.nights}`);
          console.log(`        Check-in: ${booking.checkInDate?.toDate?.()?.toDateString() || booking.checkInDate}`);
        });
      }
    }
    
    // Also check if there's a global bookings collection
    console.log('\n📋 Checking global bookings collection:');
    try {
      const globalBookingsSnapshot = await db.collection('bookings').get();
      console.log(`   Total global bookings: ${globalBookingsSnapshot.size}`);
      
      if (globalBookingsSnapshot.size > 0) {
        globalBookingsSnapshot.forEach(bookingDoc => {
          const booking = bookingDoc.data();
          if (booking.email === 'spellz49@gmail.com') {
            console.log(`     📅 Found client booking: ${bookingDoc.id}`);
            console.log(`        User ID: ${booking.userId}`);
            console.log(`        Email: ${booking.email}`);
          }
        });
      }
    } catch (error) {
      console.log('   No global bookings collection found');
    }
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  }
}

debugBookingIssue().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});