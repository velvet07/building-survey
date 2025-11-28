#!/bin/bash

# Complete fix script for server - fixes import and verifies everything

echo "🔧 Building Survey - Server Fix Script"
echo "======================================="
echo ""

# 1. Navigálás
cd /home/wpmuhel/public_html/felmeres || exit 1
echo "✅ Könyvtár: $(pwd)"
echo ""

# 2. Node.js verzió ellenőrzés
echo "📦 Node.js verzió ellenőrzése..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node.js verzió túl régi: $NODE_VERSION"
  echo "⚠️  Node.js 18+ szükséges!"
  echo "   Frissítsd a CWP7 Node.js Selector-ban!"
  exit 1
fi
echo "✅ Node.js verzió OK"
echo ""

# 3. Import javítás
echo "🔧 Import javítása a lib/projects.ts fájlban..."
if [ ! -f "lib/projects.ts" ]; then
  echo "❌ lib/projects.ts nem található!"
  exit 1
fi

# Check current import
CURRENT_IMPORT=$(grep -n "from.*auth/local" lib/projects.ts | head -1)
echo "   Aktuális import: $CURRENT_IMPORT"

if echo "$CURRENT_IMPORT" | grep -q "./auth/local"; then
  echo "⚠️  Hibás import találva: ./auth/local"
  echo "🔧 Javítás..."
  
  # Fix the import
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
  
  echo "✅ Import javítva!"
  echo "   Új import:"
  grep -n "from.*auth/local" lib/projects.ts
elif echo "$CURRENT_IMPORT" | grep -q "@/lib/auth/local"; then
  echo "✅ Import már helyes: @/lib/auth/local"
else
  echo "❌ Nem található auth/local import!"
  exit 1
fi
echo ""

# 4. Build cache törlése
echo "🧹 Build cache törlése..."
rm -rf .next
echo "✅ Cache törölve"
echo ""

# 5. Build
echo "🔨 Build futtatása..."
npm run build

BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Build sikeres!"
  
  # Check BUILD_ID
  if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "✅ BUILD_ID létrejött: $BUILD_ID"
  else
    echo "⚠️  BUILD_ID nem található!"
  fi
else
  echo ""
  echo "❌ Build hibával zárult (exit code: $BUILD_EXIT_CODE)"
  exit 1
fi

echo ""
echo "✅ Minden kész! Indíthatod az alkalmazást: npm start"

