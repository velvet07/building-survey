# 📝 Building Survey - TODO List

## ✅ Working Baseline
**Branch**: `claude/hybrid-urls-forms-fix-011CUYznPtNcvNApnP9R5bC1`
**Tag**: `v1.0-working-baseline`
**Date**: 2025-11-05

Ez a verzió működik és telepítve van production szerveren. Vannak benne hibák, amiket javítani kell.

---

## 🐛 Ismert Hibák (Bugs to Fix)

### Rajz (Drawing) Modul
- [ ] Részletek: (később dokumentálandó)
- [ ] Reprodukálási lépések: (később dokumentálandó)

### Fényképek (Photos) Modul
- [ ] Részletek: (később dokumentálandó)
- [ ] Reprodukálási lépések: (később dokumentálandó)

---

## 🔧 Tervezett Változtatások (Planned Changes)

### URL Struktúra
- [ ] URL struktúra átdolgozása
- [ ] Részletek: (később specifikálandó)

### PDF Export Bővítése
- [ ] Fényképek elemmel való bővítés
- [ ] Részletek: (később specifikálandó)

---

## ✅ Javított Hibák (Fixed in this baseline)

### "pg is not defined" Error
- ✅ Server-side és client-side kód szétválasztása
- ✅ `lib/supabase.ts` - csak client
- ✅ `lib/supabaseServer.ts` - server functions
- ✅ `next.config.js` - pg externals konfiguráció
- ✅ Docker deployment environment variables fix

### Docker Deployment
- ✅ Production-ready PostgreSQL setup
- ✅ Nginx reverse proxy
- ✅ Multi-stage Docker build
- ✅ Volume management
- ✅ Health checks
- ✅ Environment variables properly passed at build time

---

## 📚 Dokumentáció

- `DEPLOYMENT.md` - Teljes deployment útmutató
- `DEPLOY_WORKING.sh` - Tesztelt deployment script
- `.env.docker.example` - Environment változók példa
- `LAST_WORKING_COMMIT.txt` - Working commit referencia

---

## ⚠️ FONTOS MEGJEGYZÉSEK

1. **Docker volumes**: SOHA ne használj `docker-compose down -v` parancsot production-ben! Ez törli az összes adatot!

2. **Environment variables**: A build időben kell beállítani:
   ```bash
   set -a
   source .env
   set +a
   docker-compose build --no-cache
   ```

3. **Backup**: Deployment előtt mindig készíts PostgreSQL backup-ot:
   ```bash
   docker-compose exec postgres pg_dump -U postgres building_survey > backup.sql
   ```

---

## 🚀 Deployment Checklist

- [ ] Git pull legújabb változások
- [ ] Environment változók ellenőrzése (.env file)
- [ ] PostgreSQL backup készítése
- [ ] `DEPLOY_WORKING.sh` futtatása
- [ ] Logok ellenőrzése: `docker-compose logs -f app`
- [ ] Smoke test: login, projekt megnyitás, modulok tesztelése
