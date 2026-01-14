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

async function testGardenCityPrices() {
  try {
    console.log("Testing Garden City branch prices...");
    
    // Garden City branch ID: RYoG3qsKFIiy9REDFRbq
    const gardenCityBranchId = "RYoG3qsKFIiy9REDFRbq";
    const roomsRef = collection(db, "branches", gardenCityBranchId, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    
    console.log(`Found ${roomsSnap.size} rooms in Garden City branch:`);
    
    roomsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`- Room: ${data.type || 'unknown'}, Price: ₦${data.pricePerNight || 'N/A'}`);
    });
    
    if (roomsSnap.empty) {
      console.log("No rooms found in Garden City branch database");
    }
    
  } catch (error) {
    console.error("Error fetching Garden City prices:", error);
  }
}

testGardenCityPrices();