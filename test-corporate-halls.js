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

async function testCorporateHalls() {
  try {
    console.log("Testing corporate halls data fetch...");
    
    // Test 1: Check if halls collection exists
    console.log("\n1. Checking halls collection...");
    const hallsRef = collection(db, "halls");
    const hallsSnapshot = await getDocs(hallsRef);
    
    if (hallsSnapshot.empty) {
      console.log("   No halls collection found.");
    } else {
      console.log(`   Found ${hallsSnapshot.size} halls:`);
      hallsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name || doc.id}: ${data.priceRange || 'No price'}`);
      });
    }
    
    // Test 2: Check branch events data
    console.log("\n2. Checking branch events data...");
    const branchesRef = collection(db, "branches");
    const branchesSnapshot = await getDocs(branchesRef);
    
    let totalEvents = 0;
    for (const branchDoc of branchesSnapshot.docs) {
      const branchData = branchDoc.data();
      if (branchData.events && Array.isArray(branchData.events)) {
        console.log(`   Branch ${branchDoc.id}: ${branchData.events.length} events`);
        branchData.events.forEach((event, index) => {
          console.log(`     - Event ${index + 1}: ${event.type} - ${event.priceRange}`);
          totalEvents++;
        });
      }
    }
    
    console.log(`\nTotal events found across all branches: ${totalEvents}`);
    
    // Test 3: Simulate the hook logic
    console.log("\n3. Simulating useCorporateHalls hook logic...");
    let corporateHallsData = [];
    
    if (!hallsSnapshot.empty) {
      console.log("   Using halls collection data");
      corporateHallsData = hallsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else if (totalEvents > 0) {
      console.log("   Using branch events data");
      for (const branchDoc of branchesSnapshot.docs) {
        const branchData = branchDoc.data();
        if (branchData.events && Array.isArray(branchData.events)) {
          const branchHalls = branchData.events.map((event) => ({
            id: `${branchDoc.id}-${event.type.toLowerCase().replace(/\s+/g, '-')}`,
            name: event.type,
            capacity: event.capacity,
            priceRange: event.priceRange,
            description: `Professional ${event.type} venue with modern amenities and excellent service.`,
            features: event.features || [],
            type: event.type
          }));
          corporateHallsData.push(...branchHalls);
        }
      }
    } else {
      console.log("   No data found in Firestore");
    }
    
    console.log(`\nFinal corporate halls data: ${corporateHallsData.length} halls`);
    corporateHallsData.forEach((hall) => {
      console.log(`   - ${hall.name}: ${hall.priceRange} (${hall.capacity})`);
    });
    
  } catch (error) {
    console.error("Error testing corporate halls:", error);
  }
}

testCorporateHalls();