import { db } from "./src/lib/firebase.ts";
import { collection, getDocs } from "firebase/firestore";

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