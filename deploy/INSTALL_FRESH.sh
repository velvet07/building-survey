#!/bin/bash

# Building Survey - Teljes telepítési script (tiszta install)
# Futtasd le SSH-n keresztül a szerveren

set -e  # Exit on error

echo "🚀 Building Survey - Teljes telepítés"
echo "======================================"
echo ""

# 1. Navigálás
APP_DIR="/home/wpmuhel/public_html/felmeres"
cd "$APP_DIR" || { echo "❌ Nem található a könyvtár: $APP_DIR"; exit 1; }
echo "✅ Könyvtár: $(pwd)"
echo ""

# 2. Node.js verzió ellenőrzése
echo "📦 Node.js verzió ellenőrzése..."
NODE_VERSION=$(node -v 2>/dev/null || echo "NOT_FOUND")
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" == "NOT_FOUND" ] || [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node.js verzió túl régi vagy nem található: $NODE_VERSION"
  echo ""
  echo "⚠️  MEGOLDÁS:"
  echo "   1. Lépj be a CWP7 panelbe"
  echo "   2. Nyisd meg a 'Node.js Selector' opciót"
  echo "   3. Válaszd ki a Node.js 18+ verziót (pl. v18.17.0 vagy v22.21.0)"
  echo "   4. Állítsd be az alkalmazás könyvtárát: $APP_DIR"
  echo "   5. Mentsd el és futtasd újra ezt a scriptet"
  echo ""
  exit 1
fi

echo "✅ Node.js verzió OK: $NODE_VERSION"
echo ""

# 3. Import ellenőrzés és javítás
echo "🔧 Import ellenőrzése..."
if [ ! -f "lib/projects.ts" ]; then
  echo "❌ lib/projects.ts nem található!"
  exit 1
fi

CURRENT_IMPORT=$(grep -n "from.*auth/local" lib/projects.ts | head -1)
if echo "$CURRENT_IMPORT" | grep -q "./auth/local"; then
  echo "⚠️  Hibás import találva, javítás..."
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
  echo "✅ Import javítva"
elif echo "$CURRENT_IMPORT" | grep -q "@/lib/auth/local"; then
  echo "✅ Import helyes: @/lib/auth/local"
else
  echo "⚠️  Nem található auth/local import, de folytatjuk..."
fi
echo ""

# 4. Függőségek telepítése
echo "📦 Függőségek telepítése..."
rm -rf node_modules
npm install
echo "✅ Függőségek telepítve"
echo ""

# 5. Build cache törlése
echo "🧹 Build cache törlése..."
rm -rf .next
echo "✅ Cache törölve"
echo ""

# 6. Build futtatása
echo "🔨 Build futtatása..."
echo "   (Ez eltarthat néhány percig...)"
echo ""

npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build sikeres!"
  
  # 7. Build ellenőrzés
  if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "✅ BUILD_ID létrejött: $BUILD_ID"
  else
    echo "⚠️  BUILD_ID nem található!"
    exit 1
  fi
else
  echo ""
  echo "❌ Build hibával zárult!"
  exit 1
fi

echo ""
echo "======================================"
echo "✅ Telepítés befejezve!"
echo ""
echo "Következő lépés:"
echo "   npm start"
echo ""
echo "Vagy indítsd el a CWP7 Node.js Selector-ben"
echo "======================================"

