# 🚀 Gyors telepítés - Building Survey

Ha **újra feltöltötted** a teljes deploy mappát, kövesd ezeket a lépéseket:

## 1. SSH kapcsolódás

```bash
ssh felhasználó@felmeres.wpmuhely.com
```

## 2. Navigálás az alkalmazás könyvtárába

```bash
cd /home/wpmuhel/public_html/felmeres
```

## 3. Automatikus telepítés (AJÁNLOTT)

```bash
chmod +x INSTALL_FRESH.sh
./INSTALL_FRESH.sh
```

Ez a script mindent elvégzi automatikusan:
- Node.js verzió ellenőrzés
- Import javítás
- Függőségek telepítése
- Build cache törlése
- Build futtatása

## 4. Manuális telepítés (ha a script nem működik)

```bash
# 1. Node.js verzió ellenőrzés
node -v
# Eredménynek 18+ kell lennie (pl. v22.21.1)

# 2. Import javítás (ha szükséges)
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts

# 3. Függőségek telepítése
rm -rf node_modules
npm install

# 4. Build cache törlése
rm -rf .next

# 5. Build futtatása
npm run build

# 6. Ellenőrzés
ls -la .next/BUILD_ID
# Léteznie kell a BUILD_ID fájlnak
```

## 5. Alkalmazás indítása

**⚠️ FONTOS:** Ha már fut egy régi verzió, először le kell állítani!

```bash
# Opció 1: Automatikus újraindítás (AJÁNLOTT)
chmod +x RESTART_APP.sh
./RESTART_APP.sh

# Opció 2: Manuális leállítás és indítás
# 1. Keressük meg a futó folyamatot
lsof -i :4000
# vagy
ps aux | grep "next start"

# 2. Állítsd le (cseréld ki a PID-t)
kill -9 [PID]

# 3. Indítsd el
npm start
```

Vagy használd a CWP7 Node.js Selector-t:
- **STOP** → várj 5 másodpercet → **START**
- Indítási parancs: `npm start`
- Port: `4000`

## 6. Hibaelhárítás

### Node.js verzió probléma

Ha a build még mindig a régi Node.js verziót használja:

1. **CWP7 Node.js Selector:**
   - Lépj be a CWP7 panelbe
   - Nyisd meg a "Node.js Selector" opciót
   - Válaszd ki a Node.js 22.21.1 vagy újabb verziót
   - Állítsd be az alkalmazás könyvtárát: `/home/wpmuhel/public_html/felmeres`
   - Mentsd el

2. **SSH-n keresztül ellenőrzés:**
   ```bash
   which node
   node -v
   # Most már 22.21.1-nek kell lennie
   ```

### Import hiba

Ha még mindig `Cannot find module './auth/local'` hibát kapsz:

```bash
# Ellenőrizd az importot
grep -n "from.*auth/local" lib/projects.ts

# Ha './auth/local' látszik, javítsd:
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts

# Töröld a build cache-t
rm -rf .next

# Újra buildelés
npm run build
```

### Build sikertelen

Ha a build hibával zárul:

1. Töröld a cache-t: `rm -rf .next node_modules`
2. Telepítsd újra a függőségeket: `npm install`
3. Buildeld újra: `npm run build`

### Port már foglalt (EADDRINUSE)

Ha a 4000-es port már foglalt:

**Opció 1: STOP script használata (AJÁNLOTT)**
```bash
chmod +x STOP_APP.sh
./STOP_APP.sh
```

**Opció 2: Manuális keresés**
```bash
# Keresd meg a folyamatot több módon
netstat -tlnp | grep 4000
# vagy
ss -tlnp | grep 4000
# vagy
ps aux | grep -E "node|next" | grep -v grep

# Állítsd le a talált PID-t
kill -9 [PID]
```

**Opció 3: CWP7 Node.js Selector**
- Lépj be a CWP7 panelbe
- Node.js Selector → STOP
- Várj 5 másodpercet

## ✅ Telepítés befejezve!

Ha minden rendben, az alkalmazás elérhető lesz:
- URL: `https://felmeres.wpmuhely.com`
- Port: `4000` (belső)

