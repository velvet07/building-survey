# 🏗️ Building Survey - Telepítendő Verzió

Ez a mappa tartalmazza az összes fájlt, amit a szerverre kell másolni a telepítéshez.

## 📦 Tartalom

Ez a mappa tartalmazza:
- ✅ Alkalmazás forráskód (app/, components/, lib/, stb.)
- ✅ Docker konfiguráció (Dockerfile, docker-compose.yml)
- ✅ Telepítési scriptek (start.sh, stop.sh, logs.sh, rebuild.sh)
- ✅ Adatbázis sémák (database/, docker/postgres/)
- ✅ Konfigurációs fájlok (package.json, next.config.js, stb.)

## 🚀 Telepítés

### Docker telepítéshez:

1. Másold ezt a teljes `deploy/` mappát a szerverre
2. Lépj be a mappába: `cd deploy`
3. Hozd létre a `.env` fájlt (lásd: INSTALL.md)
4. Futtasd: `./start.sh`

### cPanel/CWP7 telepítéshez (Docker nélkül):

1. Másold a `deploy/` mappa tartalmát a webhosting könyvtáradba
2. Hozd létre a `.env` fájlt
3. Telepítsd a függőségeket: `npm install --production`
4. Build: `npm run build`
5. Indítás: `npm start`

## 📚 További információ

Részletes telepítési útmutatók a fő mappában:
- `../INSTALL.md` - Docker telepítési útmutató
- `../INSTALL_CWP7.md` - CWP7 telepítési útmutató
- `../INSTALL_CPANEL.md` - cPanel telepítési útmutató

