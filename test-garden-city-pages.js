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

async function testGardenCityPages() {
  try {
    console.log("Testing Garden City branch pages...");
    
    // Garden City branch ID: RYoG3qsKFIiy9REDFRbq
    const gardenCityBranchId = "RYoG3qsKFIiy9REDFRbq";
    const roomsRef = collection(db, "branches", gardenCityBranchId, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    
    console.log(`Found ${roomsSnap.size} rooms in Garden City branch:`);
    
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
    console.log(`Branch page: http://localhost:3000/branch/garden-city`);
    
    roomTypes.forEach(room => {
      const urlSlug = room.type.replace(/\s+/g, '-');
      console.log(`Room detail page: http://localhost:3000/branch/garden-city/${urlSlug}`);
      console.log(`Alternative room page: http://localhost:3000/rooms/${urlSlug}`);
    });
    
    console.log("\nTest these URLs and check if prices match the Firestore data above.");
    
  } catch (error) {
    console.error("Error fetching Garden City data:", error);
  }
}

// Run the test
testGardenCityPages();