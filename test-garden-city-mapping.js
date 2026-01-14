import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Use the same Firebase configuration as the main project
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

async function testGardenCityRoomMapping() {
  try {
    console.log("Testing Garden City room mapping...");
    
    const gardenCityBranchId = "RYoG3qsKFIiy9REDFRbq";
    const roomsRef = collection(db, "branches", gardenCityBranchId, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    
    console.log("Available room types in Firestore:");
    const firestoreTypes = [];
    roomsSnap.forEach(doc => {
      const data = doc.data();
      firestoreTypes.push(data.type);
      console.log(`- "${data.type}": ₦${data.pricePerNight}`);
    });
    
    console.log("\nTesting room name variations:");
    const staticRoomNames = ["Standard Room", "Superior Room", "Deluxe Room", "Junior Suite", "Executive Suite"];
    
    staticRoomNames.forEach(roomName => {
      const decodedRoomId = roomName.toLowerCase().replace(/\s+/g, '-');
      const roomNameVariations = [
        roomName.toLowerCase(),
        roomName.toLowerCase().replace(/\s+/g, '-'),
        roomName.toLowerCase().replace(/\s+/g, ''),
        roomName.toLowerCase().split(' ')[0]
      ];
      
      console.log(`\nRoom: "${roomName}" -> URL: "${decodedRoomId}"`);
      console.log("Variations to try:", roomNameVariations);
      
      // Check which variation matches Firestore
      roomNameVariations.forEach(variation => {
        if (firestoreTypes.includes(variation)) {
          console.log(`✅ Found match: "${variation}"`);
        }
      });
    });
    
  } catch (error) {
    console.error("Error testing Garden City room mapping:", error);
  }
}

testGardenCityRoomMapping();