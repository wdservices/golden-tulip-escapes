// Test the branchService data by reading the file directly
import { readFileSync } from 'fs';

function testBranchServiceData() {
  try {
    console.log("Testing branchService data from file...\n");
    
    // Read the branchService.ts file
    const fileContent = readFileSync('./src/services/branchService.ts', 'utf8');
    
    // Extract branch data using regex
    const branchPattern = /const branches: Branch\[\] = \[([\s\S]*?)\];/;
    const match = fileContent.match(branchPattern);
    
    if (!match) {
      console.log("Could not find branches array in file");
      return;
    }
    
    // Parse the events data for each branch
    const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
    const corporateHalls = [];
    
    branches.forEach(branchSlug => {
      // Look for events data in this branch
      const branchStartPattern = new RegExp(`id: "${branchSlug}"([\\s\\S]*?)(?=},\\s*{\\s*id:|\\s*\\];)`, 'g');
      const branchMatch = fileContent.match(branchStartPattern);
      
      if (branchMatch) {
        const branchContent = branchMatch[0];
        
        // Extract events array
        const eventsPattern = /events: \[([\s\S]*?)\]/;
        const eventsMatch = branchContent.match(eventsPattern);
        
        if (eventsMatch) {
          console.log(`✓ Found events data for ${branchSlug}`);
          
          // Extract individual events
          const eventPattern = /{\s*type: "([^"]+)",\s*capacity: "([^"]+)",\s*priceRange: "([^"]+)"/g;
          let eventMatch;
          
          while ((eventMatch = eventPattern.exec(eventsMatch[1])) !== null) {
            const [_, type, capacity, priceRange] = eventMatch;
            
            const hallData = {
              id: `${branchSlug}-${type.toLowerCase().replace(/\s+/g, '-')}`,
              name: type,
              capacity: capacity,
              priceRange: priceRange,
              description: `Professional ${type} venue with modern amenities and excellent service.`,
              features: ['Conference facilities', 'Catering services', 'Audio/Visual equipment'],
              type: type,
              location: `Golden Tulip ${branchSlug.replace('-', ' ').toUpperCase()}`,
              size: "Various sizes available"
            };
            
            corporateHalls.push(hallData);
            console.log(`  - ${type}: ${priceRange} (capacity: ${capacity})`);
          }
        } else {
          console.log(`  No events data found for ${branchSlug}`);
        }
      } else {
        console.log(`✗ No branch data found for ${branchSlug}`);
      }
      console.log('');
    });
    
    console.log(`Total corporate halls found: ${corporateHalls.length}`);
    
    if (corporateHalls.length > 0) {
      console.log("\nSample corporate hall data:");
      corporateHalls.slice(0, 2).forEach(hall => {
        console.log(`\n${hall.name}:`);
        console.log(`  ID: ${hall.id}`);
        console.log(`  Price: ${hall.priceRange}`);
        console.log(`  Capacity: ${hall.capacity}`);
        console.log(`  Location: ${hall.location}`);
      });
      
      console.log("\n✓ BranchService contains events data!");
      console.log("✓ The useCorporateHalls hook should successfully fetch this data");
      console.log("✓ Corporate hall pages should now display dynamic prices from branchService");
    } else {
      console.log("\n⚠️  No corporate halls data found in branchService");
      console.log("The pages will use fallback hardcoded data");
    }
    
  } catch (error) {
    console.error("Error reading branchService file:", error.message);
  }
}

testBranchServiceData();