#!/bin/bash

# Complete fix script for lib/projects.ts import and rebuild

echo "🔧 Fixing import in lib/projects.ts..."

cd "$(dirname "$0")" || exit 1

PROJECTS_FILE="lib/projects.ts"

if [ ! -f "$PROJECTS_FILE" ]; then
  echo "❌ Error: $PROJECTS_FILE not found!"
  exit 1
fi

# Check current import
CURRENT_IMPORT=$(grep -n "from.*auth/local" "$PROJECTS_FILE" | head -1)

if echo "$CURRENT_IMPORT" | grep -q "./auth/local"; then
  echo "⚠️  Found wrong import: ./auth/local"
  echo "🔧 Fixing import..."
  
  # Fix the import using sed
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" "$PROJECTS_FILE"
  
  echo "✅ Import fixed!"
elif echo "$CURRENT_IMPORT" | grep -q "@/lib/auth/local"; then
  echo "✅ Import is already correct: @/lib/auth/local"
else
  echo "❌ Error: Could not find auth/local import in $PROJECTS_FILE"
  exit 1
fi

echo ""
echo "🧹 Cleaning build cache..."
rm -rf .next

echo ""
echo "🔨 Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful!"
  echo "✅ Ready to start: npm start"
else
  echo ""
  echo "❌ Build failed! Check the errors above."
  exit 1
fi

