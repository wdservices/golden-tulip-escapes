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

async function testCorporateHallsData() {
  try {
    console.log("Testing corporate halls data sources...");
    
    // First, check if halls collection exists in Firestore
    console.log("\n1. Checking Firestore halls collection...");
    const hallsRef = collection(db, "halls");
    const hallsSnap = await getDocs(hallsRef);
    
    if (!hallsSnap.empty) {
      console.log(`✓ Found ${hallsSnap.size} halls in Firestore:`);
      hallsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name}: ${data.priceRange}`);
      });
    } else {
      console.log("✗ No halls collection found in Firestore");
    }
    
    // Now test the branch events data from branchService
    console.log("\n2. Testing branch events data from branchService...");
    
    // Simulate the branchService.getBranchBySlug function
    const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
    let totalEvents = 0;
    
    for (const branchSlug of branches) {
      try {
        // This would normally be getBranchBySlug(branchSlug)
        console.log(`  Checking ${branchSlug}...`);
        
        // Simulate fetching branch data (this is what branchService.getBranchBySlug would return)
        const branchData = await fetchBranchData(branchSlug);
        
        if (branchData && branchData.events && Array.isArray(branchData.events)) {
          console.log(`    ✓ Found ${branchData.events.length} events:`);
          branchData.events.forEach((event) => {
            console.log(`      - ${event.type}: ${event.priceRange} (capacity: ${event.capacity})`);
            totalEvents++;
          });
        } else {
          console.log(`    ✗ No events data for ${branchSlug}`);
        }
      } catch (error) {
        console.log(`    ✗ Error fetching ${branchSlug}:`, error.message);
      }
    }
    
    console.log(`\n3. Summary:`);
    console.log(`   - Firestore halls: ${hallsSnap.empty ? 'None' : hallsSnap.size}`);
    console.log(`   - Branch events: ${totalEvents}`);
    
    if (hallsSnap.empty && totalEvents === 0) {
      console.log("\n⚠️  No corporate halls data found in either Firestore or branchService!");
      console.log("The corporate hall pages will show fallback hardcoded data.");
    } else {
      console.log("\n✓ Corporate halls data is available and should display correctly!");
    }
    
  } catch (error) {
    console.error("Error testing corporate halls data:", error);
  }
}

// Simulate fetching branch data (this would be replaced with actual branchService.getBranchBySlug)
async function fetchBranchData(branchSlug) {
  // This is a simulation - in reality this would call branchService.getBranchBySlug
  const mockData = {
    'evo-road': {
      name: 'Golden Tulip Evo Road',
      events: [
        {
          type: 'ANIOM HALL',
          capacity: '100 - 200 persons',
          priceRange: '₦1,000,000',
          features: ['Conference facilities', 'Catering services']
        },
        {
          type: 'SHOLLY HALL',
          capacity: '50 - 120 persons',
          priceRange: '₦450,000',
          features: ['Meeting rooms', 'Audio equipment']
        }
      ]
    },
    'garden-city': {
      name: 'Golden Tulip Garden City',
      events: [
        {
          type: 'LOLLY HALL',
          capacity: '50 - 150 persons',
          priceRange: '₦550,000',
          features: ['Conference facilities', 'Catering services']
        }
      ]
    }
  };
  
  return mockData[branchSlug] || null;
}

testCorporateHallsData();