// CommonJS version for Docker build
const fs = require('fs');
const path = require('path');

// Create the @shared directory in node_modules if it doesn't exist
const sharedDir = path.resolve(__dirname, 'node_modules/@shared');
if (!fs.existsSync(sharedDir)) {
  fs.mkdirSync(sharedDir, { recursive: true });
}

// Copy all files from the shared directory to node_modules/@shared
const sourceDir = path.resolve(__dirname, '../shared');
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(sharedDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to node_modules/@shared`);
    } else {
      // For directories, recursively copy
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      const subFiles = fs.readdirSync(sourcePath);
      subFiles.forEach(subFile => {
        const subSourcePath = path.join(sourcePath, subFile);
        const subDestPath = path.join(destPath, subFile);
        
        if (fs.statSync(subSourcePath).isFile()) {
          fs.copyFileSync(subSourcePath, subDestPath);
          console.log(`Copied ${file}/${subFile} to node_modules/@shared`);
        }
      });
    }
  });
  
  console.log('Shared directory linked successfully!');
} else {
  console.error('Shared directory not found!');
  process.exit(1);
} 