// Test the actual branchService.getBranchBySlug function
import { getBranchBySlug } from './src/services/branchService.js';

async function testRealBranchService() {
  console.log("Testing real branchService.getBranchBySlug function...\n");
  
  const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
  const corporateHalls = [];
  
  for (const branchSlug of branches) {
    try {
      console.log(`Fetching ${branchSlug}...`);
      const branchData = await getBranchBySlug(branchSlug);
      
      if (branchData) {
        console.log(`✓ Found ${branchData.name}:`);
        
        if (branchData.events && Array.isArray(branchData.events)) {
          console.log(`  Events (${branchData.events.length}):`);
          
          branchData.events.forEach(event => {
            const hallData = {
              id: `${branchSlug}-${event.type.toLowerCase().replace(/\s+/g, '-')}`,
              name: event.type,
              capacity: event.capacity,
              priceRange: event.priceRange,
              description: `Professional ${event.type} venue with modern amenities and excellent service.`,
              features: event.features || [],
              type: event.type,
              location: `${branchData.name}, ${branchData.location}`,
              size: "Various sizes available"
            };
            
            corporateHalls.push(hallData);
            console.log(`    - ${event.type}: ${event.priceRange} (capacity: ${event.capacity})`);
          });
        } else {
          console.log(`  No events data found`);
        }
        console.log('');
      } else {
        console.log(`✗ No data found for ${branchSlug}`);
      }
    } catch (error) {
      console.log(`✗ Error fetching ${branchSlug}:`, error.message);
    }
  }
  
  console.log(`\nTotal corporate halls found: ${corporateHalls.length}`);
  
  // Test specific halls
  if (corporateHalls.length > 0) {
    console.log("\nSample corporate hall data:");
    corporateHalls.slice(0, 2).forEach(hall => {
      console.log(`\n${hall.name}:`);
      console.log(`  ID: ${hall.id}`);
      console.log(`  Price: ${hall.priceRange}`);
      console.log(`  Capacity: ${hall.capacity}`);
      console.log(`  Location: ${hall.location}`);
      console.log(`  Features: ${hall.features.join(', ')}`);
    });
    
    console.log("\n✓ Real branchService data is available!");
    console.log("✓ The useCorporateHalls hook should successfully fetch this data");
    console.log("✓ Corporate hall pages should now display dynamic prices from branchService");
  } else {
    console.log("\n⚠️  No corporate halls data found in branchService");
    console.log("The pages will use fallback hardcoded data");
  }
}

testRealBranchService().catch(console.error);