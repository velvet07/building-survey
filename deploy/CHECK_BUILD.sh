#!/bin/bash

###############################################################################
# Building Survey - Build ellenőrző script
###############################################################################
# Ez a script ellenőrzi, hogy a build megfelelően létrejött-e
###############################################################################

echo "🔍 Build állapot ellenőrzése"
echo "=============================="
echo ""

# Színkódok
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Build ID ellenőrzése
echo -e "${YELLOW}1. Build ID ellenőrzése...${NC}"
if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo -e "${GREEN}   ✓ Build ID megtalálva: $BUILD_ID${NC}"
else
    echo -e "${RED}   ❌ Build ID nem található!${NC}"
    echo "   A build valószínűleg nem fejeződött be vagy nincs feltöltve."
    echo ""
    echo "Megoldás:"
    echo "  1. Futtasd le: ./SERVER_COMPLETE_FIX.sh"
    echo "  2. Vagy: npm run build"
    exit 1
fi
echo ""

# 2. .next mappa ellenőrzése
echo -e "${YELLOW}2. .next mappa szerkezet ellenőrzése...${NC}"
if [ -d ".next" ]; then
    echo "   .next mappa létezik"

    # Fontos almappák ellenőrzése
    REQUIRED_DIRS=("static" "static/chunks" "static/chunks/app" "server" "server/app")
    ALL_OK=true

    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d ".next/$dir" ]; then
            echo -e "${GREEN}   ✓ .next/$dir${NC}"
        else
            echo -e "${RED}   ❌ .next/$dir hiányzik${NC}"
            ALL_OK=false
        fi
    done

    if [ "$ALL_OK" = true ]; then
        echo -e "${GREEN}   ✓ Minden kötelező mappa megtalálható${NC}"
    fi
else
    echo -e "${RED}   ❌ .next mappa nem található!${NC}"
    echo "   A build egyáltalán nem lett lefuttatva."
    exit 1
fi
echo ""

# 3. Install page chunk ellenőrzése
echo -e "${YELLOW}3. Install page chunk fájlok ellenőrzése...${NC}"
INSTALL_CHUNKS=$(find .next/static/chunks/app/install -name "*.js" 2>/dev/null | wc -l)
if [ "$INSTALL_CHUNKS" -gt 0 ]; then
    echo -e "${GREEN}   ✓ $INSTALL_CHUNKS darab install chunk fájl található${NC}"
    echo "   Fájlok:"
    find .next/static/chunks/app/install -name "*.js" 2>/dev/null | head -5
else
    echo -e "${RED}   ❌ Nincs install chunk fájl!${NC}"
    echo "   Ez magyarázza a 400 hibát."
fi
echo ""

# 4. Fájlméretek ellenőrzése
echo -e "${YELLOW}4. .next mappa mérete...${NC}"
NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
echo "   Teljes méret: $NEXT_SIZE"

if [ -d ".next/static" ]; then
    STATIC_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1)
    echo "   Static fájlok: $STATIC_SIZE"
fi
echo ""

# 5. Node modules ellenőrzése
echo -e "${YELLOW}5. Node modules ellenőrzése...${NC}"
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo -e "${GREEN}   ✓ node_modules létezik ($MODULE_COUNT csomag)${NC}"
else
    echo -e "${RED}   ❌ node_modules hiányzik!${NC}"
    echo "   Futtasd le: npm install"
fi
echo ""

# 6. Package.json build script ellenőrzése
echo -e "${YELLOW}6. Build script ellenőrzése...${NC}"
if grep -q '"build"' package.json; then
    BUILD_SCRIPT=$(grep '"build"' package.json)
    echo "   Build script: $BUILD_SCRIPT"
else
    echo -e "${RED}   ❌ Build script nem található package.json-ban${NC}"
fi
echo ""

# 7. .env fájl ellenőrzése
echo -e "${YELLOW}7. Környezeti változók ellenőrzése...${NC}"
if [ -f ".env" ]; then
    if grep -q "DB_HOST=" .env && grep -q "DB_NAME=" .env; then
        echo -e "${GREEN}   ✓ .env fájl rendben van${NC}"
    else
        echo -e "${YELLOW}   ⚠ .env fájl hiányos (de az installer majd beállítja)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠ Nincs .env fájl (de az installer majd létrehozza)${NC}"
fi
echo ""

# Összefoglaló
echo "=============================="
echo -e "${YELLOW}Összefoglaló:${NC}"
echo "=============================="

if [ -f ".next/BUILD_ID" ] && [ "$INSTALL_CHUNKS" -gt 0 ] && [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ A build rendben van, az alkalmazás működőképes kell legyen!${NC}"
    echo ""
    echo "Ha továbbra is 400 hibát kapsz:"
    echo "  1. Ellenőrizd, hogy az alkalmazás fut-e: ps aux | grep next"
    echo "  2. Nézd meg a logokat: tail -f nohup.out"
    echo "  3. Próbáld újraindítani: ./RESTART_APP.sh"
    echo "  4. Ellenőrizd a webszerver (Apache/Nginx) beállításait"
else
    echo -e "${RED}❌ A build hiányos vagy sérült!${NC}"
    echo ""
    echo "Javasolt megoldás:"
    echo "  ./SERVER_COMPLETE_FIX.sh"
    echo ""
    echo "Ez törli a régi buildet és újraépíti az alkalmazást."
fi
echo ""
