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

async function checkHallsData() {
  try {
    console.log("Checking halls data in Firestore...");
    
    const hallsRef = collection(db, "halls");
    const hallsSnap = await getDocs(hallsRef);
    
    console.log(`Found ${hallsSnap.size} halls in Firestore:`);
    
    if (hallsSnap.size === 0) {
      console.log("No halls found. Corporate halls need to be added to Firestore by an admin.");
      console.log("\nCurrent corporate halls are hardcoded in:");
      console.log("- src/pages/CorporateHallDetailPage.tsx");
      console.log("- src/pages/CorporateHallsPage.tsx");
      console.log("\nTo fix this:");
      console.log("1. An admin needs to run the add-corporate-halls-to-firestore.js script");
      console.log("2. Then update the corporate hall pages to fetch from Firestore");
    } else {
      hallsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- Hall: ${data.name}, Price: ${data.priceRange}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking halls data:", error);
  }
}

checkHallsData();