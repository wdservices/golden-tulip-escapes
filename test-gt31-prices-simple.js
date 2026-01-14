// Simple test to check GT31 prices from Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration (you'll need to add your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA8r2p2ek4qXzKrH5QKx6rQKqKqKqKqKqK",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GT31_BRANCH_ID = "UShvwSYpMNpuNaS32MxZ";

async function testGT31Prices() {
  console.log("Testing GT31 price fetching...");
  console.log("Branch ID:", GT31_BRANCH_ID);
  
  try {
    const roomsRef = collection(db, "branches", GT31_BRANCH_ID, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    
    if (roomsSnap.empty) {
      console.log("No rooms found for GT31 branch");
      return;
    }
    
    console.log("Found rooms:");
    roomsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.type}: ₦${data.pricePerNight}`);
    });
    
  } catch (error) {
    console.error("Error fetching GT31 rooms:", error);
  }
}

testGT31Prices();