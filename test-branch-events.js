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

async function testBranchEvents() {
  try {
    console.log("Testing branch events data...");
    
    // Check branch events data
    const branchesRef = collection(db, "branches");
    const branchesSnapshot = await getDocs(branchesRef);
    
    console.log(`Found ${branchesSnapshot.size} branches:`);
    let totalEvents = 0;
    
    for (const branchDoc of branchesSnapshot.docs) {
      const branchData = branchDoc.data();
      console.log(`\nBranch: ${branchDoc.id}`);
      console.log(`  Name: ${branchData.name || 'Unknown'}`);
      console.log(`  Location: ${branchData.location || 'Unknown'}`);
      
      if (branchData.events && Array.isArray(branchData.events)) {
        console.log(`  Events (${branchData.events.length}):`);
        branchData.events.forEach((event, index) => {
          console.log(`    ${index + 1}. ${event.type} - ${event.priceRange} (${event.capacity})`);
          totalEvents++;
        });
      } else {
        console.log(`  No events found`);
      }
    }
    
    console.log(`\nTotal events across all branches: ${totalEvents}`);
    
    // Test creating corporate halls from events
    if (totalEvents > 0) {
      console.log("\nConverting events to corporate halls format...");
      const corporateHalls = [];
      
      for (const branchDoc of branchesSnapshot.docs) {
        const branchData = branchDoc.data();
        if (branchData.events && Array.isArray(branchData.events)) {
          const branchHalls = branchData.events.map(event => ({
            id: `${branchDoc.id}-${event.type.toLowerCase().replace(/\s+/g, '-')}`,
            name: event.type,
            capacity: event.capacity,
            priceRange: event.priceRange,
            description: `Professional ${event.type} venue with modern amenities and excellent service.`,
            features: event.features || [],
            type: event.type,
            branchId: branchDoc.id,
            branchName: branchData.name || 'Unknown'
          }));
          corporateHalls.push(...branchHalls);
        }
      }
      
      console.log(`\nGenerated ${corporateHalls.length} corporate halls:`);
      corporateHalls.forEach(hall => {
        console.log(`  - ${hall.name}: ${hall.priceRange} (${hall.capacity}) from ${hall.branchName}`);
      });
    }
    
  } catch (error) {
    console.error("Error testing branch events:", error);
  }
}

testBranchEvents();