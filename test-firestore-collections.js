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

async function testFirestoreCollections() {
  try {
    console.log("Testing Firestore collections...");
    
    // Check branches collection
    const branchesRef = collection(db, "branches");
    const branchesSnap = await getDocs(branchesRef);
    console.log(`Found ${branchesSnap.size} branches:`);
    
    branchesSnap.forEach(doc => {
      const data = doc.data();
      console.log(`- Branch: ${data.name || 'unknown'} (${doc.id})`);
      
      // Check if branch has events/halls
      if (data.events) {
        console.log(`  - Has ${data.events.length} events/halls`);
      }
    });
    
    // Check if there's a separate halls collection
    try {
      const hallsRef = collection(db, "halls");
      const hallsSnap = await getDocs(hallsRef);
      console.log(`Found ${hallsSnap.size} halls in separate collection:`);
      
      hallsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- Hall: ${data.name || 'unknown'} (${doc.id})`);
      });
    } catch (error) {
      console.log("No separate halls collection found");
    }
    
    // Check if there's an events collection
    try {
      const eventsRef = collection(db, "events");
      const eventsSnap = await getDocs(eventsRef);
      console.log(`Found ${eventsSnap.size} events in separate collection:`);
      
      eventsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- Event: ${data.name || 'unknown'} (${doc.id})`);
      });
    } catch (error) {
      console.log("No separate events collection found");
    }
    
    console.log("\nChecking specific branches for events...");
    
    // Check specific branches for events
    const branchIds = ["5vkOc2peS2tAoTyHcmQp", "RYoG3qsKFIiy9REDFRbq", "UShvwSYpMNpuNaS32MxZ"];
    
    for (const branchId of branchIds) {
      try {
        const branchRef = collection(db, "branches", branchId, "events");
        const eventsSnap = await getDocs(branchRef);
        console.log(`Branch ${branchId}: Found ${eventsSnap.size} events`);
        
        eventsSnap.forEach(doc => {
          const data = doc.data();
          console.log(`  - Event: ${data.name || data.type || 'unknown'} - ₦${data.price || 'N/A'}`);
        });
      } catch (error) {
        console.log(`Branch ${branchId}: No events collection`);
      }
    }
    
  } catch (error) {
    console.error("Error testing Firestore collections:", error);
  }
}

testFirestoreCollections();