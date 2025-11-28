#!/bin/bash

# Quick fix script for lib/projects.ts import
# Run this on the server via SSH

echo "🔧 Fixing import in lib/projects.ts..."

# Check if file exists
if [ ! -f "lib/projects.ts" ]; then
  echo "❌ Error: lib/projects.ts not found!"
  echo "   Make sure you're in the correct directory (where package.json is)"
  exit 1
fi

# Check current import
echo "🔍 Checking current import..."
CURRENT_IMPORT=$(grep -n "from.*auth/local" lib/projects.ts | head -1)
echo "Current: $CURRENT_IMPORT"

# Fix if needed
if echo "$CURRENT_IMPORT" | grep -q "./auth/local"; then
  echo "⚠️  Found wrong import: ./auth/local"
  echo "🔧 Fixing import..."
  
  # Fix the import
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
  
  echo "✅ Import fixed!"
  echo "📝 New import:"
  grep -n "from.*auth/local" lib/projects.ts
elif echo "$CURRENT_IMPORT" | grep -q "@/lib/auth/local"; then
  echo "✅ Import is already correct: @/lib/auth/local"
else
  echo "❌ Error: Could not find auth/local import"
  exit 1
fi

echo ""
echo "✅ Done! Now run: npm run build"

