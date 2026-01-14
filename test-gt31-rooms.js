import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your Firebase configuration (from application)
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testGT31Rooms() {
  try {
    console.log("Testing GT31 (Stadium Road) branch rooms...");
    
    // GT31 branch ID: UShvwSYpMNpuNaS32MxZ
    const gt31BranchId = "UShvwSYpMNpuNaS32MxZ";
    const roomsRef = collection(db, "branches", gt31BranchId, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    
    console.log(`Found ${roomsSnap.size} rooms in GT31 branch:`);
    
    const roomTypes = [];
    roomsSnap.forEach(doc => {
      const data = doc.data();
      roomTypes.push({
        type: data.type,
        price: data.pricePerNight,
        id: doc.id
      });
      console.log(`- Room: ${data.type || 'unknown'}, Price: ₦${data.pricePerNight || 'N/A'}`);
    });
    
    console.log("\nExpected URLs for testing:");
    console.log(`Branch page: http://localhost:3000/branch/stadium-31`);
    
    roomTypes.forEach(room => {
      const urlSlug = room.type.replace(/\s+/g, '-');
      console.log(`Room detail page: http://localhost:3000/branch/stadium-31/${urlSlug}`);
      console.log(`Alternative room page: http://localhost:3000/rooms/${urlSlug}`);
    });
    
    console.log("\nTest these URLs and check if prices match the Firestore data above.");
    
  } catch (error) {
    console.error("Error fetching GT31 rooms:", error);
  }
}

testGT31Rooms();