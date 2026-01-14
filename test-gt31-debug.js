import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration (same as the main app)
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testGT31Prices() {
  console.log('Testing GT31 price fetching...');
  
  // GT31 branch ID
  const gt31BranchId = 'UShvwSYpMNpuNaS32MxZ';
  
  try {
    // Fetch rooms from Firestore
    const roomsRef = collection(db, 'branches', gt31BranchId, 'rooms');
    const roomsSnap = await getDocs(roomsRef);
    
    console.log(`Found ${roomsSnap.size} rooms in GT31 Firestore:`);
    
    const firestoreRooms = [];
    roomsSnap.forEach(doc => {
      const data = doc.data();
      firestoreRooms.push({
        id: doc.id,
        type: data.type,
        pricePerNight: data.pricePerNight,
        name: data.name
      });
      console.log(`- ${data.type || data.name}: ₦${data.pricePerNight}`);
    });
    
    // Test room name variations that BranchRooms and RoomDetailPage use
    const staticRoomNames = [
      'Deluxe Room',
      'Executive Deluxe Room',
      'Executive Twin Room',
      'Super Executive Room'
    ];
    
    console.log('\nTesting room name mapping:');
    
    for (const staticName of staticRoomNames) {
      console.log(`\nLooking for: "${staticName}"`);
      
      // Create variations like the components do
      const variations = [
        staticName.toLowerCase(),
        staticName.toLowerCase().replace(/\s+/g, '-'),
        staticName.toLowerCase().replace(/\s+/g, ''),
        staticName.toLowerCase().split(' ')[0]
      ];
      
      console.log('Variations to try:', variations);
      
      let found = false;
      for (const variation of variations) {
        const matchingRoom = firestoreRooms.find(room => 
          room.type?.toLowerCase() === variation || 
          room.name?.toLowerCase() === variation
        );
        
        if (matchingRoom) {
          console.log(`✓ Found match with variation "${variation}": ₦${matchingRoom.pricePerNight}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`✗ No match found for "${staticName}"`);
      }
    }
    
    // Test specific queries like RoomDetailPage does
    console.log('\nTesting specific Firestore queries:');
    
    for (const staticName of staticRoomNames) {
      let dbType = staticName.toLowerCase();
      
      // Handle specific mappings like RoomDetailPage does
      if (staticName.toLowerCase() === 'deluxe room') {
        dbType = 'deluxe';
      } else if (staticName.toLowerCase() === 'standard room') {
        dbType = 'standard-room';
      } else if (staticName.toLowerCase() === 'superior room') {
        dbType = 'superior-room';
      } else if (staticName.toLowerCase() === 'junior suite') {
        dbType = 'junior-suite';
      } else if (staticName.toLowerCase() === 'executive suite') {
        dbType = 'executive-suite';
      }
      
      console.log(`\nQuerying for type: "${dbType}"`);
      
      const q = query(roomsRef, where('type', '==', dbType));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const docData = querySnap.docs[0].data();
        console.log(`✓ Found: ₦${docData.pricePerNight}`);
      } else {
        console.log(`✗ Not found`);
      }
    }
    
  } catch (error) {
    console.error('Error testing GT31 prices:', error);
  }
}

testGT31Prices();
