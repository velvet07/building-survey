#!/usr/bin/env node

/**
 * Build check script
 * Checks if the build completed successfully
 */

const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');
const buildIdFile = path.join(nextDir, 'BUILD_ID');
const standaloneDir = path.join(nextDir, 'standalone');

console.log('🔍 Checking build status...\n');
console.log('Current working directory:', process.cwd());
console.log('');

// Check if .next directory exists
if (!fs.existsSync(nextDir)) {
  console.log('❌ .next directory does not exist!');
  console.log('   Run: npm run build');
  process.exit(1);
}

console.log('✅ .next directory exists');

// Check if BUILD_ID exists
if (!fs.existsSync(buildIdFile)) {
  console.log('❌ BUILD_ID file does not exist!');
  console.log('   This means the build did not complete successfully.');
  console.log('');
  console.log('   Checking .next directory contents:');
  try {
    const files = fs.readdirSync(nextDir);
    files.forEach(file => {
      const filePath = path.join(nextDir, file);
      const stat = fs.statSync(filePath);
      const type = stat.isDirectory() ? 'DIR' : 'FILE';
      console.log(`   ${type}: ${file}`);
    });
  } catch (error) {
    console.log('   Error reading .next directory:', error.message);
  }
  console.log('');
  console.log('   Solution: Run "npm run build" again and check for errors.');
  process.exit(1);
}

// Read BUILD_ID
const buildId = fs.readFileSync(buildIdFile, 'utf8').trim();
console.log('✅ BUILD_ID exists:', buildId);

// Check standalone output (if configured)
if (fs.existsSync(standaloneDir)) {
  console.log('✅ Standalone build exists');
} else {
  console.log('ℹ️  Standalone build not found (this is OK if not using standalone mode)');
}

console.log('');
console.log('✅ Build is complete and ready to start!');
console.log('   Run: npm start');

