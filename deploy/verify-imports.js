#!/usr/bin/env node

/**
 * Verify that all imports in lib/projects.ts are correct
 */

const fs = require('fs');
const path = require('path');

const projectsFile = path.join(__dirname, 'lib', 'projects.ts');

if (!fs.existsSync(projectsFile)) {
  console.error('❌ lib/projects.ts not found!');
  process.exit(1);
}

const content = fs.readFileSync(projectsFile, 'utf8');

// Check for the correct import
if (content.includes("from '@/lib/auth/local'")) {
  console.log('✅ Correct import found: @/lib/auth/local');
} else if (content.includes("from './auth/local'")) {
  console.error('❌ Wrong import found: ./auth/local');
  console.error('   Should be: @/lib/auth/local');
  process.exit(1);
} else {
  console.error('❌ No auth/local import found!');
  process.exit(1);
}

console.log('✅ All imports are correct!');

