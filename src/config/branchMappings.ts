// Auto-generated branch ID mappings
export const BRANCH_ID_MAPPINGS = {
  "evo-road": {
    "databaseId": "AS5mYsGNnvA4cxLIPL3W",
    "staticId": "evo-road",
    "name": "GOLDEN TULIP EVO ROAD ",
    "location": "Port Harcourt, Nigeria"
  },
  "evergreen": {
    "databaseId": "PoqhCkWH04tMKmZTehVi",
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
    "databaseId": "dD0zwzVpa27fZWhxTg7m",
    "staticId": "garden-city",
    "name": "GOLDEN TULIP GARDEN CITY ",
    "location": "Port Harcourt, Nigeria"
  }
};

// Helper function to get database ID from static ID
export function getDatabaseBranchId(staticId: string): string {
  return BRANCH_ID_MAPPINGS[staticId]?.databaseId || staticId;
}

// Helper function to get static ID from database ID
export function getStaticBranchId(databaseId: string): string {
  const mapping = Object.values(BRANCH_ID_MAPPINGS).find(m => m.databaseId === databaseId);
  return mapping?.staticId || databaseId;
}
