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

async function checkClientTotalStays() {
  try {
    console.log('🔍 Checking client data for document ID: dwPmcSdHSGxmnyWuBiQ1');
    
    // 1. Try to fetch client data from users collection by document ID
    let clientDoc = await db.collection('users').doc('dwPmcSdHSGxmnyWuBiQ1').get();
    let clientData = null;
    let clientId = 'dwPmcSdHSGxmnyWuBiQ1';
    
    if (!clientDoc.exists) {
      console.log('❌ Client not found in users collection by document ID');
      
      // Search by email in users collection
      console.log('🔍 Searching for spellz49@gmail.com in users collection...');
      const emailQuery = await db.collection('users').where('email', '==', 'spellz49@gmail.com').get();
      
      if (!emailQuery.empty) {
        clientDoc = emailQuery.docs[0];
        clientData = clientDoc.data();
        clientId = clientDoc.id;
        console.log('✅ Client found by email with ID:', clientId);
      } else {
        console.log('❌ Client not found by email in users collection');
        
        // Check adminUsers collection
        console.log('🔍 Checking adminUsers collection...');
        const adminQuery = await db.collection('adminUsers').where('email', '==', 'spellz49@gmail.com').get();
        
        if (!adminQuery.empty) {
          clientDoc = adminQuery.docs[0];
          clientData = clientDoc.data();
          clientId = clientDoc.id;
          console.log('✅ Client found in adminUsers collection with ID:', clientId);
        } else {
          console.log('❌ Client not found in any user collection');
          
          // Still proceed to check bookings by email
          console.log('🔍 Proceeding to check bookings by email only...');
          clientData = { email: 'spellz49@gmail.com', firstName: 'Unknown', lastName: 'User' };
        }
      }
    } else {
      clientData = clientDoc.data();
      console.log('✅ Client found by document ID');
    }
    console.log('✅ Client found:', {
      email: clientData.email,
      name: `${clientData.firstName} ${clientData.lastName}`,
      role: clientData.role,
      createdAt: clientData.createdAt?.toDate?.()
    });
    
    // 2. Check for bookings in all possible locations
    console.log('\n📚 Checking booking history...');
    
    // Check global bookings collection
    const globalBookingsQuery = await db.collection('bookings')
      .where('userId', '==', clientId)
      .get();
    
    console.log(`Global bookings collection: ${globalBookingsQuery.size} bookings found`);
    
    // Check bookings by email
    const emailBookingsQuery = await db.collection('bookings')
      .where('email', '==', clientData.email)
      .get();
    
    console.log(`Global bookings by email: ${emailBookingsQuery.size} bookings found`);
    
    // Check branch-specific bookings
    const branches = ['main', 'evo-road', 'waterlines', 'airforce'];
    let totalBranchBookings = 0;
    
    for (const branchId of branches) {
      try {
        // Check by userId
        const branchBookingsQuery = await db.collection('branches')
          .doc(branchId)
          .collection('bookings')
          .where('userId', '==', clientId)
          .get();
        
        // Check by email
        const branchEmailBookingsQuery = await db.collection('branches')
          .doc(branchId)
          .collection('bookings')
          .where('email', '==', clientData.email)
          .get();
        
        const branchTotal = branchBookingsQuery.size + branchEmailBookingsQuery.size;
        totalBranchBookings += branchTotal;
        
        if (branchTotal > 0) {
          console.log(`Branch ${branchId}: ${branchTotal} bookings found`);
          
          // Show booking details
          const allBranchBookings = [...branchBookingsQuery.docs, ...branchEmailBookingsQuery.docs];
          allBranchBookings.forEach((doc, index) => {
            const booking = doc.data();
            console.log(`  Booking ${index + 1}:`, {
              id: doc.id,
              checkIn: booking.checkInDate?.toDate?.(),
              checkOut: booking.checkOutDate?.toDate?.(),
              status: booking.status,
              branchName: booking.branchName,
              nights: booking.nights || 'not calculated'
            });
          });
        }
      } catch (error) {
        console.log(`Branch ${branchId}: Collection may not exist`);
      }
    }
    
    console.log(`\nTotal branch bookings: ${totalBranchBookings}`);
    
    // 3. Calculate total nights/stays
    let totalNights = 0;
    let totalBookings = 0;
    
    // Process all bookings to calculate nights
    const allBookings = [
      ...globalBookingsQuery.docs,
      ...emailBookingsQuery.docs
    ];
    
    // Add branch bookings
    for (const branchId of branches) {
      try {
        const branchBookingsQuery = await db.collection('branches')
          .doc(branchId)
          .collection('bookings')
          .where('userId', '==', clientId)
          .get();
        
        const branchEmailBookingsQuery = await db.collection('branches')
          .doc(branchId)
          .collection('bookings')
          .where('email', '==', clientData.email)
          .get();
        
        allBookings.push(...branchBookingsQuery.docs, ...branchEmailBookingsQuery.docs);
      } catch (error) {
        // Branch collection may not exist
      }
    }
    
    // Remove duplicates based on document ID
    const uniqueBookings = allBookings.filter((booking, index, self) => 
      index === self.findIndex(b => b.id === booking.id)
    );
    
    console.log(`\n📊 Processing ${uniqueBookings.length} unique bookings...`);
    
    uniqueBookings.forEach((doc, index) => {
      const booking = doc.data();
      totalBookings++;
      
      // Calculate nights
      let nights = 0;
      if (booking.checkInDate && booking.checkOutDate) {
        const checkIn = booking.checkInDate.toDate();
        const checkOut = booking.checkOutDate.toDate();
        nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      } else if (booking.nights) {
        nights = booking.nights;
      }
      
      totalNights += nights;
      
      console.log(`Booking ${index + 1}: ${nights} nights (${booking.status || 'no status'})`);
    });
    
    console.log('\n🎯 SUMMARY:');
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Total Nights/Stays: ${totalNights}`);
    console.log(`Client Email: ${clientData.email}`);
    
    // 4. Check what the dashboard should be showing
    console.log('\n🔧 Dashboard Logic Check:');
    console.log('The UserDashboard should be calculating total stays from booking nights.');
    console.log('If total stays is showing 0, there might be an issue with:');
    console.log('1. Booking data structure (missing nights field)');
    console.log('2. Date calculation logic');
    console.log('3. User ID matching');
    console.log('4. Collection querying logic');
    
  } catch (error) {
    console.error('❌ Error checking client data:', error);
  }
}

checkClientTotalStays().then(() => {
  console.log('\n✅ Client check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});