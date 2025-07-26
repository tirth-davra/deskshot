const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting custom build process...');

// Step 1: Build Next.js renderer
console.log('📦 Building renderer process...');
execSync('npx next build renderer', { stdio: 'inherit' });

// Step 2: Build Electron main process
console.log('⚡ Building main process...');
execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });

// Step 3: Copy necessary files
console.log('📋 Copying files...');
const appDir = path.join(__dirname, 'app');
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// Copy package.json
fs.copyFileSync('package.json', path.join(appDir, 'package.json'));

console.log('✅ Build completed successfully!');
console.log('📁 App files are in the "app" directory');
console.log('🔧 Run "npm run make" to create the installer'); 