#!/bin/bash

# Fix import in lib/projects.ts
# This script fixes the import path from './auth/local' to '@/lib/auth/local'

PROJECTS_FILE="lib/projects.ts"

if [ ! -f "$PROJECTS_FILE" ]; then
  echo "❌ Error: $PROJECTS_FILE not found!"
  exit 1
fi

echo "🔍 Checking current import..."
CURRENT_IMPORT=$(grep -n "from.*auth/local" "$PROJECTS_FILE" | head -1)

if echo "$CURRENT_IMPORT" | grep -q "./auth/local"; then
  echo "⚠️  Found wrong import: ./auth/local"
  echo "🔧 Fixing import..."
  
  # Fix the import using sed
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" "$PROJECTS_FILE"
  
  echo "✅ Import fixed!"
  echo "📝 New import:"
  grep -n "from.*auth/local" "$PROJECTS_FILE"
elif echo "$CURRENT_IMPORT" | grep -q "@/lib/auth/local"; then
  echo "✅ Import is already correct: @/lib/auth/local"
else
  echo "❌ Error: Could not find auth/local import in $PROJECTS_FILE"
  exit 1
fi

