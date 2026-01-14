import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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

async function checkBranchEvents() {
  try {
    console.log("Checking branch data structure...");
    
    // Check each branch for events data
    const branchIds = ["5vkOc2peS2tAoTyHcmQp", "RYoG3qsKFIiy9REDFRbq", "UShvwSYpMNpuNaS32MxZ"];
    
    for (const branchId of branchIds) {
      const branchDoc = doc(db, "branches", branchId);
      const branchSnap = await getDoc(branchDoc);
      
      if (branchSnap.exists()) {
        const data = branchSnap.data();
        console.log(`\nBranch ${branchId} (${data.name}):`);
        console.log(`- Has events field: ${data.events ? 'Yes' : 'No'}`);
        if (data.events) {
          console.log(`- Number of events: ${data.events.length}`);
          data.events.forEach((event, index) => {
            console.log(`  ${index + 1}. ${event.type} - ${event.priceRange}`);
          });
        }
      }
    }
    
    console.log("\nRecommendation: Corporate halls/events should be stored in Firestore as part of branch data or in a separate events collection.");
    
  } catch (error) {
    console.error("Error checking branch events:", error);
  }
}

checkBranchEvents();