import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDashboardBookingData() {
  console.log('🔍 Testing dashboard booking data loading...');
  
  const clientEmail = 'spellz49@gmail.com';
  const clientId = '32C17pYhpD5xuaf1RcSq';
  
  try {
    // Helper to normalize Firestore Timestamp or ISO string to ISO string
    const toIso = (v) => {
      if (!v) return new Date().toISOString();
      if (typeof v === 'string') {
        const d = new Date(v);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }
      if (typeof v.toDate === 'function') {
        try { return v.toDate().toISOString(); } catch { return new Date().toISOString(); }
      }
      try { return new Date(v).toISOString(); } catch { return new Date().toISOString(); }
    };

    // Initialize with default values
    let bookings = [];
    const branchCount = {};
    let stats = {
      totalBookings: 0,
      totalNights: 0,
      loyaltyPoints: 0,
      upcomingTrips: 0,
      pastTrips: 0
    };

    // First, get all available branches
    const branchesRef = collection(db, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);
    
    console.log(`📍 Found ${branchesSnapshot.docs.length} branches`);
    
    // Query each branch's bookings subcollection for user's bookings
    const branchQueries = branchesSnapshot.docs.map(async (branchDoc) => {
      try {
        const branchId = branchDoc.id;
        const branchData = branchDoc.data();
        console.log(`🏨 Checking branch: ${branchData.name || branchId}`);
        
        const bookingsRef = collection(db, 'branches', branchId, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', clientId),
          limit(20) // Limit per branch to prevent performance issues
        );

        const querySnapshot = await getDocs(q);
        const branchBookings = [];
        
        console.log(`  📋 Found ${querySnapshot.docs.length} bookings in this branch`);
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            const booking = {
              ...data,
              id: doc.id,
              checkInDate: toIso(data.checkInDate),
              checkOutDate: toIso(data.checkOutDate),
              bookingDate: toIso(data.bookingDate),
            };
            
            branchBookings.push(booking);
            console.log(`    📅 Booking: ${booking.nights || 1} nights (${new Date(booking.checkInDate).toDateString()})`);
          } catch (error) {
            console.warn(`    ⚠️ Error processing booking ${doc.id}:`, error);
          }
        });

        return branchBookings;
      } catch (error) {
        console.warn(`⚠️ Could not load bookings from branch ${branchDoc.id}:`, error);
        return [];
      }
    });

    // Wait for all branch queries to complete and combine results
    const allBranchBookings = await Promise.all(branchQueries);
    bookings = allBranchBookings.flat();
    
    console.log(`\n📊 Total bookings found: ${bookings.length}`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found for client');
      return;
    }

    // Sort bookings by checkInDate in descending order
    bookings.sort((a, b) => {
      const dateA = new Date(a.checkInDate);
      const dateB = new Date(b.checkInDate);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Limit total bookings to 50 for performance
    bookings = bookings.slice(0, 50);

    // Calculate statistics
    const now = new Date();
    let totalNights = 0;
    let pastTrips = 0;
    let upcomingTrips = 0;

    bookings.forEach((booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const nights = booking.nights || 1;
      
      totalNights += nights;
      
      // Count branch occurrences for favorite branch calculation
      const branchName = booking.branchName || 'Unknown Branch';
      branchCount[branchName] = (branchCount[branchName] || 0) + 1;
      
      // Categorize as past or upcoming
      if (checkInDate < now) {
        pastTrips++;
      } else {
        upcomingTrips++;
      }
    });

    // Calculate loyalty points (10 points per night + 50 bonus per booking)
    const loyaltyPoints = (totalNights * 10) + (bookings.length * 50);

    // Find favorite branch (most bookings)
    let favoriteBranch = '';
    let maxCount = 0;
    Object.entries(branchCount).forEach(([branch, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteBranch = branch;
      }
    });

    stats = {
      totalBookings: bookings.length,
      totalNights,
      loyaltyPoints,
      upcomingTrips,
      pastTrips,
      favoriteBranch
    };

    console.log('\n📈 Dashboard Statistics:');
    console.log(`- Total Bookings: ${stats.totalBookings}`);
    console.log(`- Total Nights: ${stats.totalNights}`);
    console.log(`- Past Trips: ${stats.pastTrips}`);
    console.log(`- Upcoming Trips: ${stats.upcomingTrips}`);
    console.log(`- Loyalty Points: ${stats.loyaltyPoints}`);
    console.log(`- Favorite Branch: ${stats.favoriteBranch}`);

    console.log('\n✅ Dashboard data loading test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing dashboard data:', error);
  }
}

testDashboardBookingData();