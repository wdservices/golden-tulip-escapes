export const branchIdMapping: { [key: string]: string } = {
  "stadium-31": "UShvwSYpMNpuNaS32MxZ",
  "evo-road": "URcvGkmbfrOFInlOS4I9",
  "evergreen": "5vkOc2peS2tAoTyHcmQp",
  "garden-city": "RYoG3qsKFIiy9REDFRbq",
};

export const getFirestoreBranchId = (urlBranchId: string): string => {
  return branchIdMapping[urlBranchId] || urlBranchId;
};
