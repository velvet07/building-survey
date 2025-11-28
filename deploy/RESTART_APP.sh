#!/bin/bash

# Script az alkalmazás újraindításához

set -e

APP_DIR="/home/wpmuhel/public_html/felmeres"
PORT=4000

echo "🔄 Building Survey - Alkalmazás újraindítása"
echo "============================================="
echo ""

cd "$APP_DIR" || exit 1

# 1. Keresd meg és állítsd le a futó folyamatot
echo "🛑 Futó alkalmazás leállítása..."

# Több módszerrel keressük meg a folyamatot
PID=""

# Módszer 1: netstat használata (ha elérhető)
if command -v netstat >/dev/null 2>&1; then
  PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -1)
fi

# Módszer 2: ss használata (ha netstat nincs)
if [ -z "$PID" ] && command -v ss >/dev/null 2>&1; then
  PID=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1)
fi

# Módszer 3: ps és grep használata (Next.js folyamat keresése)
if [ -z "$PID" ]; then
  PID=$(ps aux | grep -E "next start|next-server|node.*next" | grep -v grep | awk '{print $2}' | head -1)
fi

# Módszer 4: fuser használata (ha elérhető)
if [ -z "$PID" ] && command -v fuser >/dev/null 2>&1; then
  PID=$(fuser $PORT/tcp 2>/dev/null | awk '{print $1}')
fi

# Leállítás
if [ -n "$PID" ]; then
  echo "   Talált folyamat PID: $PID"
  echo "   Folyamat részletek:"
  ps -p $PID -o pid,cmd,etime 2>/dev/null || true
  echo ""
  echo "   Leállítás..."
  kill -9 $PID 2>/dev/null || true
  sleep 2
  
  # Ellenőrzés, hogy leállt-e
  if ps -p $PID >/dev/null 2>&1; then
    echo "   ⚠️  A folyamat még fut, újra próbálkozás..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
  echo "✅ Folyamat leállítva"
else
  echo "   Nincs futó folyamat találva a $PORT porton"
  echo "   (Ez rendben van, ha első alkalommal indítod)"
fi

# 2. Ellenőrizd, hogy van-e build
if [ ! -f ".next/BUILD_ID" ]; then
  echo "❌ Nincs build! Futtasd le: npm run build"
  exit 1
fi

echo "✅ Build ellenőrzve: $(cat .next/BUILD_ID)"
echo ""

# 3. Indítsd el az alkalmazást
echo "🚀 Alkalmazás indítása a $PORT porton..."
nohup npm start > /dev/null 2>&1 &

sleep 3

# 4. Ellenőrizd, hogy elindult-e
sleep 2
NEW_PID=""

# Több módszerrel keresés
if command -v netstat >/dev/null 2>&1; then
  NEW_PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -1)
elif command -v ss >/dev/null 2>&1; then
  NEW_PID=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1)
else
  NEW_PID=$(ps aux | grep -E "next start|next-server" | grep -v grep | awk '{print $2}' | head -1)
fi

if [ -n "$NEW_PID" ]; then
  echo "✅ Alkalmazás elindult! PID: $NEW_PID"
  echo ""
  echo "🌐 Alkalmazás elérhető: https://felmeres.wpmuhely.com"
  echo ""
  echo "Folyamat részletek:"
  ps -p $NEW_PID -o pid,user,cmd,etime 2>/dev/null || true
else
  echo "❌ Az alkalmazás nem indult el!"
  echo ""
  echo "Ellenőrzés:"
  echo "  - Port foglalt: netstat -tlnp | grep $PORT (ha elérhető)"
  echo "  - Next.js folyamatok: ps aux | grep next"
  echo ""
  echo "Próbáld manuálisan:"
  echo "  npm start"
  exit 1
fi

