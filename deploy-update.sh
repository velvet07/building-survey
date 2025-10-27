#!/bin/bash
# Szerver frissítési script - PostgreSQL Direct migration

set -e

echo "🔄 Building Survey - PostgreSQL Direct frissítés telepítése"
echo "============================================================"

# 1. Docker szolgáltatás újraindítása
echo ""
echo "📌 1. Docker szolgáltatás újraindítása (iptables fix)..."
systemctl restart docker
echo "✅ Docker újraindítva, várakozás 5 másodperc..."
sleep 5

# 2. Docker Compose indítása
echo ""
echo "📌 2. Docker konténerek indítása..."
cd /home/wpmuhel/public_html/felmeres
docker compose down 2>/dev/null || true
docker compose up -d

echo "✅ Konténerek elindítva, várakozás 15 másodperc..."
sleep 15

# 3. Ellenőrzés hogy a konténerek futnak-e
echo ""
echo "📌 3. Konténerek állapotának ellenőrzése..."
docker compose ps

# 4. Node.js függőségek telepítése a containerben
echo ""
echo "📌 4. Node.js függőségek telepítése (pg library)..."
docker compose exec -T building-survey-app npm install

# 5. Build a containerben
echo ""
echo "📌 5. Next.js build futtatása..."
docker compose exec -T building-survey-app npm run build

# 6. App container restart
echo ""
echo "📌 6. App konténer újraindítása..."
docker compose restart building-survey-app

echo ""
echo "⏳ Várakozás 10 másodperc az alkalmazás indulására..."
sleep 10

# 7. Ellenőrzés
echo ""
echo "📌 7. Telepítés ellenőrzése..."
echo ""
echo "Konténer státusz:"
docker compose ps
echo ""
echo "App konténer logok (utolsó 20 sor):"
docker compose logs --tail=20 building-survey-app

echo ""
echo "============================================================"
echo "✅ Frissítés telepítése kész!"
echo ""
echo "🔍 További ellenőrzési lépések:"
echo "   1. Látogasd meg: https://felmeres.wpmuhely.com"
echo "   2. Tesztelj bejelentkezést (Supabase auth)"
echo "   3. Tesztelj projekt létrehozást (helyi PostgreSQL)"
echo "   4. Tesztelj fotó feltöltést (helyi storage)"
echo ""
echo "📊 Logok követése:"
echo "   docker compose logs -f building-survey-app"
echo ""
