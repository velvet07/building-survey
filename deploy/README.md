# 🏗️ Building Survey - Production Telepítési Csomag

Ez a mappa tartalmazza a **production-ready** verziót, amely készen áll a szerverre történő telepítésre.

---

## 🚀 Gyors Telepítés (Válassz egyet)

### 💻 1. SSH telepítő (AJÁNLOTT - leggyorsabb)
**✅ Legjobb választás, ha van SSH hozzáférésed**

```bash
# 1. Töltsd fel a fájlokat
# 2. SSH-zz be a szerverre
cd /home/wpmuhel/public_html/felmeres

# 3. Futtasd az automatikus telepítőt
chmod +x SERVER_COMPLETE_FIX.sh
./SERVER_COMPLETE_FIX.sh

# 4. Menj a /install oldalra
```

📖 **Részletes útmutató:** [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md)

---

### 🔧 2. cPanel/CWP7 Terminal (SSH nélkül)
**✅ Ha nincs SSH, de van cPanel/CWP7 Terminal hozzáférésed**

1. Töltsd fel a fájlokat FTP-vel (FileZilla, WinSCP)
2. Nyisd meg a cPanel/CWP7 Terminal-t
3. Futtasd az automatikus telepítőt:
   ```bash
   cd /home/wpmuhel/public_html/felmeres
   chmod +x SERVER_COMPLETE_FIX.sh
   ./SERVER_COMPLETE_FIX.sh
   ```
4. Menj a `/install` oldalra

📖 **Részletes útmutató:** [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md)

---

## 📦 Mit tartalmaz ez a csomag?

### Alkalmazás fájlok
- ✅ `app/` - Next.js alkalmazás (API routes, pages)
- ✅ `components/` - React komponensek
- ✅ `lib/` - Segédfüggvények, adatbázis kezelés
- ✅ `database/` - MySQL sémák és seed adatok
- ✅ `config/` - Konfigurációs fájlok
- ✅ `public/` - Statikus fájlok

### Telepítési eszközök

#### 💻 Automatikus telepítő scriptek
- `SERVER_COMPLETE_FIX.sh` - Automatikus telepítő script
- `CHECK_BUILD.sh` - Build diagnosztika (ha 400 hibát kapsz)
- `RESTART_APP.sh` - Újraindító script
- `STOP_APP.sh` - Leállító script
- `DEPLOY_COMPLETE_GUIDE.md` - Teljes SSH útmutató

#### 📖 Telepítési útmutatók
- `DEPLOY_COMPLETE_GUIDE.md` - Teljes telepítési útmutató (SSH és cPanel Terminal)
- `QUICK_INSTALL.md` - Gyors telepítési lépések
- `RESTART_INSTRUCTIONS.md` - Újraindítási útmutató

### Konfigurációs fájlok
- `package.json` - NPM függőségek
- `next.config.js` - Next.js konfiguráció
- `tsconfig.json` - TypeScript konfiguráció
- `tailwind.config.ts` - Tailwind CSS
- `middleware.ts` - Next.js middleware (auth védelem)

---

## 🎯 Melyik telepítési módot válasszam?

| Szituáció | Ajánlott módszer |
|-----------|------------------|
| ✅ Van SSH hozzáférésem | 💻 **SSH telepítő** (leggyorsabb) |
| ⚠️ Nincs SSH, van cPanel Terminal | 🔧 **cPanel Terminal** |
| ❌ Csak FTP van | 🔧 **cPanel Terminal** (FTP + Terminal) |
| 🐳 Docker környezet | 📦 Docker compose |
| 🆕 Először telepítem | 💻 **SSH telepítő** vagy 🔧 **cPanel Terminal** |
| 🔄 Frissítés | 💻 **SSH telepítő** |

---

## 📚 Részletes Dokumentáció

### Telepítési útmutatók
1. **[DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md)** - Teljes telepítési útmutató
2. **[QUICK_INSTALL.md](QUICK_INSTALL.md)** - Gyors telepítés (rövid)
3. **[RESTART_INSTRUCTIONS.md](RESTART_INSTRUCTIONS.md)** - Újraindítás

### Hibaelhárítás
- **400 hiba az /install oldalon** → Futtasd: `chmod +x CHECK_BUILD.sh && ./CHECK_BUILD.sh`
- Minden hiba → [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md#hibaelhárítás)
- Build hibák → [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md#build-hibák)
- Port foglalt → [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md#port-foglalt)
- Adatbázis hiba → [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md#adatbázis-kapcsolat)

---

## ✅ Telepítés utáni lépések

1. **Alkalmazás konfiguráció:**
   - Nyisd meg: `https://your-domain.com/install`
   - Add meg az adatbázis adatokat
   - Válaszd ki a modulokat
   - Hozz létre admin felhasználót

2. **Első bejelentkezés:**
   - Menj a `/login` oldalra
   - Jelentkezz be az admin adatokkal
   - Tesztelj mindent

3. **Biztonság:**
   - ✅ `.env` fájl jogosultságok: 600
   - ✅ `uploads/` mappa jogosultságok: 755
   - ✅ Rendszeres biztonsági mentés

---

## 🔧 Rendszerkövetelmények

### Minimum követelmények
- **Node.js:** 18.0.0+ (ajánlott: 22.x)
- **MySQL:** 5.7+ vagy MariaDB 10.3+
- **RAM:** 512 MB (ajánlott: 1 GB)
- **Tárhely:** 500 MB + uploads tárhely
- **PHP:** 7.4+ (csak a web-telepítőhöz)

### Ellenőrzés
```bash
# Node.js verzió
node -v

# NPM verzió
npm -v

# MySQL verzió
mysql --version
```

---

## 📋 Telepítési Ellenőrző Lista

Mielőtt elkezded:
- [ ] Node.js 18+ telepítve
- [ ] MySQL adatbázis létrehozva
- [ ] FTP vagy SSH hozzáférés
- [ ] Tartalom feltöltve a szerverre

Telepítés közben:
- [ ] Telepítő script futott vagy web-telepítő befejezve
- [ ] Build sikeres (nincs hiba)
- [ ] Alkalmazás elindul (port 4000)
- [ ] Health check sikeres (`/api/health`)

Telepítés után:
- [ ] `/install` oldal megnyitva
- [ ] Adatbázis beállítások OK
- [ ] Admin felhasználó létrehozva
- [ ] Bejelentkezés sikeres
- [ ] Projekt létrehozható
- [ ] Fénykép feltölthető

---

## 🆘 Segítség

**Ha elakadtál:**

1. **Olvasd el a megfelelő útmutatót:**
   - SSH nélkül → [INSTALL_WITHOUT_SSH.md](INSTALL_WITHOUT_SSH.md)
   - SSH-val → [DEPLOY_COMPLETE_GUIDE.md](DEPLOY_COMPLETE_GUIDE.md)

2. **Ellenőrizd a logokat:**
   ```bash
   # Alkalmazás logok
   tail -f nohup.out

   # vagy PM2-vel
   pm2 logs

   # cPanel Error Log
   # cPanel → Metrics → Errors
   ```

3. **Próbáld újra:**
   - Sok probléma megoldódik újrapróbálással
   - Használd a `RESTART_APP.sh` scriptet

4. **Keress a hibaelhárítási szekciókban:**
   - Mindkét útmutató tartalmaz részletes hibaelhárítást

---

## 📝 Fontos Megjegyzések

### Build során megjelenő figyelmeztetések
```
Error getting session: Route /api/debug couldn't be rendered statically
```
**Ez nem hiba!** Ez csak egy figyelmeztetés, a build sikeresen befejeződik. Az API route-ok dinamikusak, nem statikusak.

### Port beállítás
Az alkalmazás **belsőleg a 4000-es porton** fut. A webszerver (Apache/Nginx) proxyként működik:
```
External: https://your-domain.com → Internal: http://localhost:4000
```

### Uploads mappa
- Lokálisan tárolódik (nem Supabase)
- Jogosultságok: 755 vagy 777
- Biztonsági mentés: `tar -czf uploads_backup.tar.gz uploads/`

---

## 🎉 Kész!

Ha minden lépést követtél, az alkalmazás készen áll a használatra:

🌐 **Alkalmazás:** https://your-domain.com
🔐 **Bejelentkezés:** https://your-domain.com/login
📊 **Dashboard:** https://your-domain.com/dashboard

**Kellemes használatot!** 🚀

---

**Verzió:** 1.2.0
**Utolsó frissítés:** 2025-11-28
**Támogatott platformok:** cPanel, CWP7, Plesk, Docker

