// Test the updated useCorporateHalls hook logic
const { getBranchBySlug } = require('./src/services/branchService.ts');

async function testBranchServiceEvents() {
  try {
    console.log("Testing branchService events data...");
    
    const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
    let allEvents = [];
    
    for (const branchSlug of branches) {
      try {
        console.log(`\nFetching branch: ${branchSlug}`);
        const branchData = getBranchBySlug(branchSlug);
        
        if (branchData) {
          console.log(`  Found branch: ${branchData.name} at ${branchData.location}`);
          
          if (branchData.events && Array.isArray(branchData.events)) {
            console.log(`  Events (${branchData.events.length}):`);
            branchData.events.forEach((event, index) => {
              console.log(`    ${index + 1}. ${event.type} - ${event.priceRange} (${event.capacity})`);
              
              // Simulate the corporate hall conversion
              const corporateHall = {
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
              
              allEvents.push(corporateHall);
            });
          } else {
            console.log(`  No events found`);
          }
        } else {
          console.log(`  Branch not found`);
        }
      } catch (error) {
        console.log(`  Error fetching ${branchSlug}:`, error.message);
      }
    }
    
    console.log(`\nTotal corporate halls generated: ${allEvents.length}`);
    allEvents.forEach(hall => {
      console.log(`  - ${hall.name}: ${hall.priceRange} (${hall.capacity})`);
    });
    
  } catch (error) {
    console.error("Error testing branchService:", error);
  }
}

testBranchServiceEvents();