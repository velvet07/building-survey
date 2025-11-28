#!/bin/bash

# Script az alkalmazás leállításához

APP_DIR="/home/wpmuhel/public_html/felmeres"
PORT=4000

echo "🛑 Building Survey - Alkalmazás leállítása"
echo "=========================================="
echo ""

cd "$APP_DIR" || exit 1

echo "Keresés a $PORT porton futó folyamatok után..."
echo ""

# Több módszerrel keressük meg a folyamatot
PIDS=()

# Módszer 1: netstat használata
if command -v netstat >/dev/null 2>&1; then
  echo "1. netstat használata..."
  NETSTAT_PIDS=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$')
  if [ -n "$NETSTAT_PIDS" ]; then
    while read -r pid; do
      PIDS+=("$pid")
      echo "   Talált PID: $pid"
    done <<< "$NETSTAT_PIDS"
  fi
fi

# Módszer 2: ss használata
if command -v ss >/dev/null 2>&1; then
  echo "2. ss használata..."
  SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+')
  if [ -n "$SS_PIDS" ]; then
    while read -r pid; do
      if [[ ! " ${PIDS[@]} " =~ " ${pid} " ]]; then
        PIDS+=("$pid")
        echo "   Talált PID: $pid"
      fi
    done <<< "$SS_PIDS"
  fi
fi

# Módszer 3: ps és grep használata (Next.js folyamat keresése)
echo "3. Next.js folyamatok keresése..."
PS_PIDS=$(ps aux | grep -E "next start|next-server|node.*next.*4000" | grep -v grep | awk '{print $2}' | grep -E '^[0-9]+$')
if [ -n "$PS_PIDS" ]; then
  while read -r pid; do
    if [[ ! " ${PIDS[@]} " =~ " ${pid} " ]]; then
      PIDS+=("$pid")
      echo "   Talált PID: $pid"
    fi
  done <<< "$PS_PIDS"
fi

# Módszer 4: fuser használata
if command -v fuser >/dev/null 2>&1; then
  echo "4. fuser használata..."
  FUSER_PIDS=$(fuser $PORT/tcp 2>/dev/null | awk '{print $1}')
  if [ -n "$FUSER_PIDS" ]; then
    for pid in $FUSER_PIDS; do
      if [[ ! " ${PIDS[@]} " =~ " ${pid} " ]]; then
        PIDS+=("$pid")
        echo "   Talált PID: $pid"
      fi
    done
  fi
fi

echo ""

if [ ${#PIDS[@]} -eq 0 ]; then
  echo "✅ Nincs futó folyamat a $PORT porton"
  echo ""
  echo "Ellenőrzés további módszerekkel:"
  echo ""
  
  # Összes Node.js folyamat listázása
  echo "Minden Node.js folyamat:"
  ps aux | grep -E "node|next" | grep -v grep | head -10 || echo "   Nincs Node.js folyamat"
  echo ""
  
  exit 0
fi

echo "Talált folyamatok:"
for pid in "${PIDS[@]}"; do
  echo ""
  echo "PID: $pid"
  ps -p $pid -o pid,user,cmd,etime 2>/dev/null || echo "   (folyamat már nem létezik)"
done

echo ""
echo "⚠️  Leállítás 3 másodperc múlva..."
sleep 3

# Leállítás
KILLED=0
for pid in "${PIDS[@]}"; do
  if ps -p $pid >/dev/null 2>&1; then
    echo "Leállítás: PID $pid"
    kill -9 $pid 2>/dev/null || true
    sleep 1
    
    # Ellenőrzés
    if ! ps -p $pid >/dev/null 2>&1; then
      echo "✅ PID $pid leállítva"
      KILLED=$((KILLED + 1))
    else
      echo "❌ PID $pid még fut"
    fi
  fi
done

echo ""
if [ $KILLED -gt 0 ]; then
  echo "✅ $KILLED folyamat leállítva"
else
  echo "⚠️  Nem sikerült leállítani a folyamatokat"
fi

echo ""
echo "Végső ellenőrzés..."
sleep 2
REMAINING=$(ps aux | grep -E "next start|next-server|node.*next.*4000" | grep -v grep | wc -l)
if [ "$REMAINING" -eq 0 ]; then
  echo "✅ Nincs több futó folyamat"
else
  echo "⚠️  Még mindig fut $REMAINING folyamat"
  ps aux | grep -E "next start|next-server|node.*next.*4000" | grep -v grep
fi

