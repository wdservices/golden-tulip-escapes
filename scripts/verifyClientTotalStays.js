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

async function verifyClientTotalStays() {
  try {
    console.log('🔍 Verifying client total stays for spellz49@gmail.com');
    
    const clientId = '32C17pYhpD5xuaf1RcSq';
    const clientEmail = 'spellz49@gmail.com';
    
    // Get all bookings for this client
    const branchesSnapshot = await db.collection('branches').get();
    let totalBookings = 0;
    let totalNights = 0;
    let pastBookings = 0;
    let upcomingBookings = 0;
    
    for (const branchDoc of branchesSnapshot.docs) {
      const bookingsSnapshot = await db.collection('branches')
        .doc(branchDoc.id)
        .collection('bookings')
        .where('userId', '==', clientId)
        .get();
      
      bookingsSnapshot.forEach(bookingDoc => {
        const booking = bookingDoc.data();
        totalBookings++;
        totalNights += booking.nights || 0;
        
        const checkInDate = booking.checkInDate.toDate();
        const now = new Date();
        
        if (checkInDate < now) {
          pastBookings++;
        } else {
          upcomingBookings++;
        }
        
        console.log(`📅 Booking: ${booking.branchName} - ${booking.nights} nights (${checkInDate.toDateString()})`);
      });
    }
    
    console.log('\n📊 Client Dashboard Stats:');
    console.log(`- Total Bookings: ${totalBookings}`);
    console.log(`- Total Nights/Stays: ${totalNights}`);
    console.log(`- Past Bookings: ${pastBookings}`);
    console.log(`- Upcoming Bookings: ${upcomingBookings}`);
    console.log(`- Loyalty Points: ${100 + totalNights}`);
    
    if (totalNights > 0) {
      console.log('\n✅ SUCCESS: Client now has booking data and should see total stays!');
    } else {
      console.log('\n❌ ISSUE: Client still has no booking data');
    }
    
  } catch (error) {
    console.error('❌ Error verifying client data:', error);
  }
}

verifyClientTotalStays().then(() => {
  console.log('\n✅ Verification completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});