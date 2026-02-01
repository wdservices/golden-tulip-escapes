const fs = require('fs');
const path = require('path');

const branches = ['evo-road', 'garden-city', 'stadium-31', 'evergreen'];
const baseDir = __dirname;
const assetsDir = path.join(baseDir, 'assets', 'branches');
const dataDir = path.join(baseDir, 'data');
const outputFile = path.join(dataDir, 'BranchImages.js');

console.log('Starting generation...');
console.log('Assets Dir:', assetsDir);
console.log('Data Dir:', dataDir);

if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
}

let fileContent = `// This file is auto-generated. Do not edit manually.
export const BRANCH_IMAGES = {
`;

branches.forEach(branch => {
  const branchDir = path.join(assetsDir, branch);
  console.log(`Processing branch: ${branch} at ${branchDir}`);
  
  if (fs.existsSync(branchDir)) {
    const files = fs.readdirSync(branchDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    console.log(`  Found ${files.length} images.`);

    fileContent += `  '${branch}': [\n`;
    files.forEach(file => {
      // Escape spaces in filenames for require if necessary? 
      // Actually require handles spaces fine in strings.
      fileContent += `    require('../assets/branches/${branch}/${file}'),\n`;
    });
    fileContent += `  ],\n`;
  } else {
    console.log(`  Directory not found!`);
    fileContent += `  '${branch}': [],\n`;
  }
});

fileContent += `};\n`;

fs.writeFileSync(outputFile, fileContent);
console.log('BranchImages.js generated successfully at ' + outputFile);
