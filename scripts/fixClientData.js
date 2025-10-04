import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const db = getFirestore();

const CLIENT_EMAIL = 'spellz49@gmail.com';

async function searchClientEverywhere() {
  console.log(`🔍 Comprehensive search for client: ${CLIENT_EMAIL}`);
  
  try {
    // 1. Search in users collection
    console.log('\n1. Searching users collection...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} total users`);
    
    let foundUser = null;
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === CLIENT_EMAIL) {
        foundUser = { id: doc.id, data: data, collection: 'users' };
        console.log('✅ Found in users collection:', doc.id);
      }
    });
    
    // 2. Search in adminUsers collection
    console.log('\n2. Searching adminUsers collection...');
    const adminUsersSnapshot = await db.collection('adminUsers').get();
    console.log(`Found ${adminUsersSnapshot.size} total admin users`);
    
    adminUsersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === CLIENT_EMAIL) {
        foundUser = { id: doc.id, data: data, collection: 'adminUsers' };
        console.log('✅ Found in adminUsers collection:', doc.id);
      }
    });
    
    // 3. Search in all bookings across branches for this email
    console.log('\n3. Searching bookings across all branches...');
    const branchesSnapshot = await db.collection('branches').get();
    const allBookings = [];
    
    for (const branchDoc of branchesSnapshot.docs) {
      const branchId = branchDoc.id;
      const branchData = branchDoc.data();
      
      console.log(`Checking bookings in branch: ${branchId} (${branchData.name})`);
      
      const bookingsSnapshot = await db.collection('branches')
        .doc(branchId)
        .collection('bookings')
        .get();
      
      let branchBookingCount = 0;
      bookingsSnapshot.forEach(doc => {
        const bookingData = doc.data();
        if (bookingData.guestEmail === CLIENT_EMAIL || bookingData.userEmail === CLIENT_EMAIL) {
          allBookings.push({
            id: doc.id,
            branchId: branchId,
            branchName: branchData.name,
            ...bookingData
          });
          branchBookingCount++;
        }
      });
      
      if (branchBookingCount > 0) {
        console.log(`✅ Found ${branchBookingCount} bookings in ${branchId}`);
      }
    }
    
    // 4. Search in old global bookings collection (if it exists)
    console.log('\n4. Checking old global bookings collection...');
    try {
      const globalBookingsSnapshot = await db.collection('bookings').get();
      console.log(`Found ${globalBookingsSnapshot.size} documents in global bookings`);
      
      globalBookingsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.guestEmail === CLIENT_EMAIL || data.userEmail === CLIENT_EMAIL) {
          allBookings.push({
            id: doc.id,
            collection: 'global_bookings',
            ...data
          });
          console.log(`✅ Found booking in global collection: ${doc.id}`);
        }
      });
    } catch (error) {
      console.log('ℹ️ Global bookings collection not accessible or doesn\'t exist');
    }
    
    // 5. List some sample users to understand the data structure
    console.log('\n5. Sample users for reference:');
    let sampleCount = 0;
    usersSnapshot.forEach(doc => {
      if (sampleCount < 3) {
        const data = doc.data();
        console.log(`Sample user: ${data.email} (ID: ${doc.id})`);
        sampleCount++;
      }
    });
    
    return { foundUser, allBookings };
  } catch (error) {
    console.error('Error in comprehensive search:', error);
    return { foundUser: null, allBookings: [] };
  }
}

async function checkBranchStructure() {
  console.log('\n🏢 Checking branch structure...');
  
  try {
    const branchesSnapshot = await db.collection('branches').get();
    
    console.log('Available branches:');
    branchesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name}`);
      console.log(`  Location: ${data.location}`);
      console.log(`  Status: ${data.status}`);
      console.log('');
    });
    
    return branchesSnapshot.docs;
  } catch (error) {
    console.error('Error checking branches:', error);
    return [];
  }
}

async function createClientIfNeeded() {
  console.log('\n👤 Creating client user if needed...');
  
  try {
    // Create the client user in the users collection
    const userData = {
      email: CLIENT_EMAIL,
      displayName: 'Test Client',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      migrationNote: 'Created to restore dashboard data after migration'
    };
    
    const userRef = await db.collection('users').add(userData);
    console.log(`✅ Created user with ID: ${userRef.id}`);
    
    return userRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

async function createBookingForClient(userId) {
  console.log('\n📝 Creating booking for client in Evo Road branch...');
  
  try {
    const bookingData = {
      userId: userId,
      guestName: 'Test Client',
      guestEmail: CLIENT_EMAIL,
      guestPhone: '+234 123 456 7890',
      roomType: 'Standard Room',
      roomId: 'standard-room-1',
      checkInDate: '2024-01-15',
      checkOutDate: '2024-01-17',
      bookingDate: '2024-01-10',
      status: 'confirmed',
      totalAmount: 50000,
      nights: 2,
      guests: 1,
      branchId: 'evo-road',
      branchName: 'GOLDEN TULIP EVO ROAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      migrationNote: 'Booking created to restore client dashboard data'
    };
    
    const bookingRef = await db.collection('branches')
      .doc('evo-road')
      .collection('bookings')
      .add(bookingData);
    
    console.log(`✅ Created booking with ID: ${bookingRef.id}`);
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
}

async function updateGRAReferences(bookings) {
  console.log('\n🔧 Updating GRA references to Evo Road...');
  
  if (bookings.length === 0) {
    console.log('ℹ️ No bookings to update');
    return 0;
  }
  
  const batch = db.batch();
  let updateCount = 0;
  
  for (const booking of bookings) {
    const needsUpdate = 
      booking.branchName?.toLowerCase().includes('gra') ||
      booking.branchId?.toLowerCase().includes('gra') ||
      booking.branchName?.toLowerCase().includes('main');
    
    if (needsUpdate) {
      console.log(`Updating booking ${booking.id}: ${booking.branchName} → GOLDEN TULIP EVO ROAD`);
      
      if (booking.collection === 'global_bookings') {
        // Update in global collection
        const bookingRef = db.collection('bookings').doc(booking.id);
        batch.update(bookingRef, {
          branchName: 'GOLDEN TULIP EVO ROAD',
          branchId: 'evo-road',
          updatedAt: new Date().toISOString(),
          migrationNote: 'Updated from GRA to Evo Road'
        });
      } else {
        // Update in branch subcollection
        const bookingRef = db.collection('branches')
          .doc(booking.branchId)
          .collection('bookings')
          .doc(booking.id);
        
        batch.update(bookingRef, {
          branchName: 'GOLDEN TULIP EVO ROAD',
          branchId: 'evo-road',
          updatedAt: new Date().toISOString(),
          migrationNote: 'Updated from GRA to Evo Road'
        });
      }
      
      updateCount++;
    }
  }
  
  if (updateCount > 0) {
    await batch.commit();
    console.log(`✅ Updated ${updateCount} booking records`);
  }
  
  return updateCount;
}

async function main() {
  console.log('🚀 Starting comprehensive client data fix...\n');
  
  try {
    // 1. Comprehensive search
    const { foundUser, allBookings } = await searchClientEverywhere();
    
    // 2. Check branch structure
    const branches = await checkBranchStructure();
    
    // 3. Handle user creation if needed
    let userId = foundUser?.id;
    if (!foundUser) {
      console.log('\n⚠️ Client not found, creating new user...');
      userId = await createClientIfNeeded();
    } else {
      console.log(`\n✅ Found client in ${foundUser.collection}: ${foundUser.id}`);
    }
    
    // 4. Update any GRA references
    if (allBookings.length > 0) {
      await updateGRAReferences(allBookings);
    }
    
    // 5. Create a booking if none exist
    if (allBookings.length === 0 && userId) {
      console.log('\n⚠️ No bookings found, creating one to restore dashboard data...');
      await createBookingForClient(userId);
    }
    
    // 6. Final verification
    console.log('\n🔍 Final verification...');
    const { foundUser: finalUser, allBookings: finalBookings } = await searchClientEverywhere();
    
    if (finalUser && finalBookings.length > 0) {
      console.log('✅ SUCCESS: Client data has been restored!');
      console.log(`   User ID: ${finalUser.id}`);
      console.log(`   Total bookings: ${finalBookings.length}`);
      
      // Calculate stats
      const branchCounts = {};
      finalBookings.forEach(booking => {
        const branchName = booking.branchName || 'Unknown';
        branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
      });
      
      const favoriteBranch = Object.keys(branchCounts).reduce((a, b) => 
        branchCounts[a] > branchCounts[b] ? a : b
      );
      
      console.log(`   Favorite branch: ${favoriteBranch}`);
      console.log(`   Branch distribution:`, branchCounts);
    } else {
      console.log('❌ Client data still not properly restored');
    }
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });