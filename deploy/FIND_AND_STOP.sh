#!/bin/bash

# Gyors script a 4000-es portot foglaló folyamat megtalálásához és leállításához

PORT=4000

echo "🔍 Keresés a $PORT portot foglaló folyamatok után..."
echo ""

# 1. netstat
if command -v netstat >/dev/null 2>&1; then
  echo "1. netstat ellenőrzés:"
  netstat -tlnp 2>/dev/null | grep ":$PORT " || echo "   Nincs találat"
  echo ""
fi

# 2. ss
if command -v ss >/dev/null 2>&1; then
  echo "2. ss ellenőrzés:"
  ss -tlnp 2>/dev/null | grep ":$PORT " || echo "   Nincs találat"
  echo ""
fi

# 3. Node.js/Next.js folyamatok
echo "3. Node.js/Next.js folyamatok:"
ps aux | grep -E "node|next" | grep -v grep || echo "   Nincs találat"
echo ""

# 4. Összes folyamat a 4000-es porton (fuser)
if command -v fuser >/dev/null 2>&1; then
  echo "4. fuser ellenőrzés:"
  fuser $PORT/tcp 2>/dev/null || echo "   Nincs találat"
  echo ""
fi

# 5. Keresés PID-re és leállítás
echo "Leállítás próbálkozás..."
PIDS_TO_KILL=()

# netstat-ből
if command -v netstat >/dev/null 2>&1; then
  PIDS=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$')
  for pid in $PIDS; do
    PIDS_TO_KILL+=("$pid")
  done
fi

# ss-ből
if command -v ss >/dev/null 2>&1; then
  PIDS=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+')
  for pid in $PIDS; do
    if [[ ! " ${PIDS_TO_KILL[@]} " =~ " ${pid} " ]]; then
      PIDS_TO_KILL+=("$pid")
    fi
  done
fi

if [ ${#PIDS_TO_KILL[@]} -eq 0 ]; then
  echo "❌ Nem található folyamat a $PORT porton"
  echo ""
  echo "Lehetséges okok:"
  echo "  1. A CWP7 Node.js Selector kezeli a folyamatot"
  echo "  2. A folyamat másképp fut"
  echo "  3. Valóban nincs futó folyamat"
  echo ""
  echo "Próbáld a CWP7 Node.js Selector-t: STOP → START"
else
  echo "Talált PID-ek: ${PIDS_TO_KILL[@]}"
  echo ""
  for pid in "${PIDS_TO_KILL[@]}"; do
    echo "Leállítás: PID $pid"
    ps -p $pid -o pid,cmd,etime 2>/dev/null || echo "   (folyamat nem létezik)"
    kill -9 $pid 2>/dev/null && echo "✅ Leállítva" || echo "❌ Nem sikerült leállítani"
  done
  echo ""
  echo "Várj 2 másodpercet..."
  sleep 2
  echo "Ellenőrzés:"
  netstat -tlnp 2>/dev/null | grep ":$PORT " || echo "✅ Port szabad!"
fi

