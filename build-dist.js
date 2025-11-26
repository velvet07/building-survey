#!/usr/bin/env node

/**
 * Build script that collects all production files into a dist/ folder
 * This creates a ready-to-deploy package for the server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(process.cwd(), 'dist');
const DEPLOY_DIR = path.join(process.cwd(), 'deploy');

console.log('🚀 Building application for production...\n');

// Step 1: Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  console.log('📁 Cleaning dist directory...');
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Step 2: Build the application
console.log('🔨 Building Next.js application...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed!');
  process.exit(1);
}

// Step 3: Copy build output
console.log('📦 Copying build files...');

// Copy .next directory
const nextDir = path.join(process.cwd(), '.next');
const distNextDir = path.join(DIST_DIR, '.next');
if (fs.existsSync(nextDir)) {
  copyDirectory(nextDir, distNextDir);
  console.log('  ✓ .next/ directory copied');
}

// Copy public directory
const publicDir = path.join(process.cwd(), 'public');
const distPublicDir = path.join(DIST_DIR, 'public');
if (fs.existsSync(publicDir)) {
  copyDirectory(publicDir, distPublicDir);
  console.log('  ✓ public/ directory copied');
}

// Step 4: Copy necessary configuration files
const configFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'middleware.ts',
];

configFiles.forEach(file => {
  const srcPath = path.join(process.cwd(), file);
  const destPath = path.join(DIST_DIR, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${file} copied`);
  }
});

// Step 5: Copy server-side files (app, components, lib, etc.)
const serverDirs = [
  'app',
  'components',
  'lib',
  'hooks',
  'types',
  'config',
  'translations',
  'database',
];

serverDirs.forEach(dir => {
  const srcPath = path.join(process.cwd(), dir);
  const distPath = path.join(DIST_DIR, dir);
  if (fs.existsSync(srcPath)) {
    copyDirectory(srcPath, distPath);
    console.log(`  ✓ ${dir}/ directory copied`);
  }
});

// Step 6: Create .env.example if it doesn't exist
const envExamplePath = path.join(DIST_DIR, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  const envExample = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=building_survey
DB_USER=root
DB_PASSWORD=

# Database URL (alternative to individual settings)
DATABASE_URL=mysql://user:password@localhost:3306/building_survey

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production

# Session
SESSION_SECRET=change-this-to-a-random-secret-key

# File Upload
UPLOAD_DIR=./uploads
`;
  fs.writeFileSync(envExamplePath, envExample);
  console.log('  ✓ .env.example created');
}

// Step 7: Create README for dist folder
const distReadme = `# Building Survey - Production Build

This folder contains the production-ready build of the Building Survey application.

## 📦 Contents

- \`.next/\` - Next.js build output
- \`public/\` - Static assets
- \`app/\` - Application pages and routes
- \`components/\` - React components
- \`lib/\` - Libraries and utilities
- \`database/\` - MySQL database schemas
- Configuration files (package.json, next.config.js, etc.)

## 🚀 Deployment

1. Upload all files from this folder to your server
2. Create a \`.env\` file (use \`.env.example\` as a template)
3. Install dependencies: \`npm install --production\`
4. Start the application: \`npm start\`

## 📝 Notes

- Make sure Node.js 18+ is installed on the server
- The \`uploads/\` directory must be writable (chmod 755 or 777)
- Database must be created before first run
- Run the installer at \`/install\` to set up the database and create admin user
`;
fs.writeFileSync(path.join(DIST_DIR, 'README.md'), distReadme);
console.log('  ✓ README.md created');

console.log('\n✅ Build package created successfully in dist/ folder!');
console.log('\n📋 Next steps:');
console.log('   1. Review the dist/ folder contents');
console.log('   2. Upload dist/ folder contents to your server');
console.log('   3. Create .env file on the server');
console.log('   4. Run: npm install --production');
console.log('   5. Run: npm start\n');

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

