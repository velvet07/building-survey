#!/bin/bash

###############################################################################
# Building Survey - Teljes szerveroldali javítás
###############################################################################
# Ez a script megoldja az összes build és deploy problémát
#
# Használat:
#   chmod +x SERVER_COMPLETE_FIX.sh
#   ./SERVER_COMPLETE_FIX.sh
###############################################################################

set -e  # Exit on any error

echo "🚀 Building Survey - Szerveroldali javítás"
echo "=========================================="
echo ""

# Színkódok
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Node.js verzió ellenőrzés
echo -e "${YELLOW}1. Node.js verzió ellenőrzése...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "   Jelenlegi verzió: $(node -v)"

if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}   ❌ HIBA: Node.js 18+ szükséges!${NC}"
    echo "   Lépj be a CWP7 Node.js Selector-ba és válaszd a Node.js 18+ verziót"
    exit 1
fi
echo -e "${GREEN}   ✓ Node.js verzió megfelelő${NC}"
echo ""

# 2. Régi folyamatok leállítása
echo -e "${YELLOW}2. Régi alkalmazás példányok leállítása...${NC}"

# Keresés port alapján
PORT_PID=$(lsof -t -i:4000 2>/dev/null || true)
if [ ! -z "$PORT_PID" ]; then
    echo "   Port 4000-en futó folyamat megtalálva: PID $PORT_PID"
    kill -9 $PORT_PID 2>/dev/null || true
    echo -e "${GREEN}   ✓ Port 4000 felszabadítva${NC}"
fi

# Keresés folyamn

év alapján
NEXT_PIDS=$(ps aux | grep -E "next.*start|node.*\.next" | grep -v grep | awk '{print $2}' || true)
if [ ! -z "$NEXT_PIDS" ]; then
    echo "   Next.js folyamatok megtalálva: $NEXT_PIDS"
    echo "$NEXT_PIDS" | xargs -r kill -9 2>/dev/null || true
    echo -e "${GREEN}   ✓ Next.js folyamatok leállítva${NC}"
fi

sleep 2
echo -e "${GREEN}   ✓ Alkalmazás leállítva${NC}"
echo ""

# 3. Régi build cache törlése
echo -e "${YELLOW}3. Régi build cache törlése...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}   ✓ Cache törölve${NC}"
echo ""

# 4. Függőségek újratelepítése
echo -e "${YELLOW}4. Függőségek újratelepítése...${NC}"
echo "   Ez eltarthat néhány percig..."
rm -rf node_modules
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}   ❌ npm install sikertelen!${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Függőségek telepítve${NC}"
echo ""

# 5. Build futtatása
echo -e "${YELLOW}5. Alkalmazás build...${NC}"
echo "   Ez eltarthat néhány percig..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}   ❌ Build sikertelen!${NC}"
    echo ""
    echo "Ellenőrizd a következőket:"
    echo "  - Van-e .env fájl az adatbázis beállításokkal"
    echo "  - Az adatbázis elérhető-e"
    echo "  - Nincs-e szintaxis hiba a kódban"
    exit 1
fi

# Build ID ellenőrzése
if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo -e "${GREEN}   ✓ Build sikeres! (ID: $BUILD_ID)${NC}"
else
    echo -e "${RED}   ❌ Build ID nem található!${NC}"
    exit 1
fi
echo ""

# 6. Uploads mappa létrehozása
echo -e "${YELLOW}6. Uploads mappa ellenőrzése...${NC}"
if [ ! -d "uploads" ]; then
    mkdir -p uploads/thumbnails
    chmod 755 uploads
    chmod 755 uploads/thumbnails
    echo -e "${GREEN}   ✓ Uploads mappa létrehozva${NC}"
else
    echo -e "${GREEN}   ✓ Uploads mappa már létezik${NC}"
fi
echo ""

# 7. Környezeti változók ellenőrzése
echo -e "${YELLOW}7. Környezeti változók ellenőrzése...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}   ❌ FIGYELEM: Nincs .env fájl!${NC}"
    echo ""
    echo "   A telepítéshez szükséges a .env fájl!"
    echo "   Az alkalmazás el fog indulni, de a /install oldalon"
    echo "   be kell állítani az adatbázis kapcsolatot."
    echo ""
else
    # Ellenőrizzük a kötelező mezőket
    if grep -q "DB_HOST=" .env && grep -q "DB_NAME=" .env; then
        echo -e "${GREEN}   ✓ .env fájl megtalálva${NC}"
    else
        echo -e "${YELLOW}   ⚠ .env fájl hiányos, az installerre lesz szükség${NC}"
    fi
fi
echo ""

# 8. Alkalmazás indítása háttérben
echo -e "${YELLOW}8. Alkalmazás indítása...${NC}"

# PM2 használata, ha elérhető
if command -v pm2 &> /dev/null; then
    echo "   PM2 használata..."
    pm2 delete building-survey 2>/dev/null || true
    pm2 start npm --name "building-survey" -- start
    pm2 save
    echo -e "${GREEN}   ✓ Alkalmazás elindítva PM2-vel${NC}"
else
    echo "   Indítás háttérben (nohup)..."
    nohup npm start > /dev/null 2>&1 &
    echo $! > app.pid
    echo -e "${GREEN}   ✓ Alkalmazás elindítva (PID: $(cat app.pid))${NC}"
    echo "   Leállításhoz futtasd: ./STOP_APP.sh"
fi
echo ""

# 9. Várakozás az indulásra
echo -e "${YELLOW}9. Várakozás az alkalmazás indulására...${NC}"
sleep 5
echo ""

# 10. Health check
echo -e "${YELLOW}10. Alkalmazás állapot ellenőrzése...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Alkalmazás fut és válaszol!${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Próbálkozás $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}   ⚠ Health check nem sikerült, de az alkalmazás elindult${NC}"
    echo "   Ellenőrizd a logokat: npm run logs (ha PM2-t használsz)"
fi
echo ""

# Összefoglaló
echo "=========================================="
echo -e "${GREEN}✅ Telepítés befejezve!${NC}"
echo "=========================================="
echo ""
echo "📋 Következő lépések:"
echo ""

if [ ! -f ".env" ] || ! grep -q "DB_HOST=" .env 2>/dev/null; then
    echo -e "${YELLOW}1. Nyisd meg az alkalmazást a böngészőben:${NC}"
    echo "   https://felmeres.wpmuhely.com"
    echo ""
    echo -e "${YELLOW}2. Menj a /install oldalra:${NC}"
    echo "   https://felmeres.wpmuhely.com/install"
    echo ""
    echo "3. Add meg az adatbázis beállításokat:"
    echo "   - Host: localhost"
    echo "   - Port: 3306"
    echo "   - Database: wpmuhel_felmeres"
    echo "   - User: wpmuhel_felmeres"
    echo "   - Password: [az adatbázis jelszava]"
    echo ""
    echo "4. Válaszd ki a modulokat és hozd létre az admin felhasználót"
    echo ""
else
    echo "1. Alkalmazás URL:"
    echo "   https://felmeres.wpmuhely.com"
    echo ""
    echo "2. Ha már telepítetted, jelentkezz be"
    echo ""
    echo "3. Ha még nem telepítetted, menj a /install oldalra:"
    echo "   https://felmeres.wpmuhely.com/install"
    echo ""
fi

echo "=========================================="
echo ""
echo "Hasznos parancsok:"
echo "  - Újraindítás:  ./RESTART_APP.sh"
echo "  - Leállítás:    ./STOP_APP.sh"
echo "  - Logok:        tail -f nohup.out   (vagy: pm2 logs)"
echo "  - Státusz:      ps aux | grep next  (vagy: pm2 status)"
echo ""
