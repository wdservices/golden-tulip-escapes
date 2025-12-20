// Auto-generated branch ID mappings
export const BRANCH_ID_MAPPINGS = {
  "evo-road": {
    "databaseId": "URcvGkmbfrOFInlOS4I9",
    "staticId": "evo-road",
    "name": "GOLDEN TULIP EVO ROAD ",
    "location": "Port Harcourt, Nigeria"
  },
  "evergreen": {
    "databaseId": "5vkOc2peS2tAoTyHcmQp",
    "staticId": "evergreen",
    "name": "GOLDEN TULIP EVERGREEN",
    "location": "Port Harcourt, Nigeria"
  },
  "stadium-31": {
    "databaseId": "UShvwSYpMNpuNaS32MxZ",
    "staticId": "stadium-31",
    "name": "GOLDEN TULIP 31 STADIUM RD.",
    "location": "Port Harcourt, Nigeria"
  },
  "garden-city": {
    "databaseId": "RYoG3qsKFIiy9REDFRbq",
    "staticId": "garden-city",
    "name": "GOLDEN TULIP GARDEN CITY ",
    "location": "Port Harcourt, Nigeria"
  },
  // Additional branch that exists in Firestore admin configuration
  "AS5mYsGNnvA4cxLIPL3W": {
    "databaseId": "AS5mYsGNnvA4cxLIPL3W",
    "staticId": "evo-road", // Map this to evo-road since that's what the user is asking about
    "name": "GOLDEN TULIP EVO ROAD (Legacy)",
    "location": "Port Harcourt, Nigeria"
  }
};

// Helper function to get database ID from static ID
export function getDatabaseBranchId(staticId: string): string {
  // First check if it's already a database ID
  const reverseMapping = Object.values(BRANCH_ID_MAPPINGS).find(m => m.databaseId === staticId);
  if (reverseMapping) {
    return staticId; // It's already a database ID
  }
  
  // Otherwise, look up by static ID
  return BRANCH_ID_MAPPINGS[staticId]?.databaseId || staticId;
}

// Helper function to get static ID from database ID
export function getStaticBranchId(databaseId: string): string {
  const mapping = Object.values(BRANCH_ID_MAPPINGS).find(m => m.databaseId === databaseId);
  return mapping?.staticId || databaseId;
}
