# SSH Telepítési Útmutató - Building Survey

Ez az útmutató segít a Building Survey alkalmazás telepítésében SSH-n keresztül CWP7/cPanel környezetben.

## 🚀 Gyors telepítés (ajánlott)

Ha **újra feltöltötted** a teljes deploy mappát, futtasd le ezt a scriptet:

```bash
cd /home/wpmuhel/public_html/felmeres
chmod +x INSTALL_FRESH.sh
./INSTALL_FRESH.sh
```

Ez a script automatikusan:
- ✅ Ellenőrzi a Node.js verziót (18+ szükséges)
- ✅ Javítja az importot ha szükséges
- ✅ Telepíti a függőségeket (`npm install`)
- ✅ Törli a build cache-t
- ✅ Buildeli az alkalmazást (`npm run build`)

## Előfeltételek

1. **SSH hozzáférés** a szerverhez
2. **Node.js 18+** telepítve (ellenőrizd: `node -v`)
3. **MySQL/MariaDB adatbázis** létrehozva a panelben
4. **Fájl feltöltés** kész (FTP vagy File Manager)

## Telepítési lépések

### 1. SSH kapcsolódás

```bash
ssh felhasználó@szerver.com
# vagy
ssh felhasználó@felmeres.wpmuhely.com
```

### 2. Navigálás az alkalmazás könyvtárába

```bash
# Állítsd be a helyes könyvtárat (pl. public_html/felmeres vagy subdomain)
cd /home/wpmuhel/public_html/felmeres

# Ellenőrizd, hogy a megfelelő helyen vagy
pwd
# Eredménynek így kell kinéznie: /home/wpmuhel/public_html/felmeres

# Ellenőrizd, hogy a package.json létezik
ls -la package.json
```

### 3. Ellenőrzés: Fájlok jelenléte

```bash
# Ellenőrizd, hogy minden fájl megvan
ls -la

# Ellenőrizd a fontos fájlokat
ls -la package.json
ls -la next.config.js
ls -la tsconfig.json
ls -la lib/projects.ts

# Ellenőrizd az importot a lib/projects.ts fájlban
grep -n "from.*auth/local" lib/projects.ts
# A kimenetnek így kell kinéznie:
# 8:import { getSession } from '@/lib/auth/local';
# Ha './auth/local'-t látsz, javítsd:
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
```

### 4. Node.js verzió ellenőrzése és frissítése

```bash
# Ellenőrizd a Node.js verziót
node -v
# Eredménynek 18+ kell lennie (pl. v18.17.0 vagy v22.21.0)

# ⚠️ FONTOS: Ha v14 vagy régebbi verziót látsz, FRISSÍTENI KELL!

# Opció 1: CWP7 Node.js Selector használata (AJÁNLOTT)
# 1. Lépj be a CWP7 panelbe
# 2. Nyisd meg a "Node.js Selector" opciót
# 3. Válaszd ki a Node.js 18+ verziót (pl. v18.17.0 vagy v22.21.0)
# 4. Állítsd be az alkalmazás könyvtárát
# 5. Mentsd el a beállításokat
# 6. SSH-n keresztül ellenőrizd:
node -v
# Most már 18+-nak kell lennie

# Opció 2: NVM (Node Version Manager) használata
# Ha nvm nincs telepítve, telepítsd:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Telepítsd a Node.js 18+ verziót
nvm install 18
# vagy
nvm install 22

# Használd a telepített verziót
nvm use 18
# vagy
nvm use 22

# Állítsd be alapértelmezettként
nvm alias default 18

# Ellenőrizd
node -v
npm -v
```

### 5. Függőségek telepítése

```bash
# Töröld a régi node_modules-t (ha van)
rm -rf node_modules

# Telepítsd a függőségeket
npm install

# Ellenőrizd, hogy sikeres volt-e
ls -la node_modules | head -20
```

### 6. Build cache törlése

```bash
# Töröld a régi build cache-t
rm -rf .next

# Ellenőrizd, hogy törölve lett
ls -la .next 2>&1
# Eredmény: "No such file or directory" vagy üres lista
```

### 7. Build futtatása

```bash
# Futtasd le a buildet
npm run build

# Figyeld a kimenetét - keress hibákat
# Ha sikeres, látnod kell:
# ✓ Compiled successfully
# Linting and checking validity of types ...
# Route (app) ... Size ... First Load JS
# ƒ Middleware ... kB

# Ha hiba van, javítsd ki és futtasd újra
```

### 8. Build ellenőrzése

```bash
# Ellenőrizd, hogy a BUILD_ID létrejött-e
ls -la .next/BUILD_ID

# Olvasd be a BUILD_ID-t
cat .next/BUILD_ID

# Ellenőrizd a .next mappa tartalmát
ls -la .next/ | head -20
```

### 9. Port beállítása

```bash
# Ellenőrizd a package.json start scriptjét
grep -A 1 '"start"' package.json
# Eredménynek így kell kinéznie:
# "start": "next start -p 4000"

# Ha nem 4000, módosítsd:
# (használd a szerveren beállított portot, pl. 4000)
```

### 10. Alkalmazás indítása

```bash
# Indítsd el az alkalmazást
npm start

# Vagy háttérben:
nohup npm start > /dev/null 2>&1 &

# Ellenőrizd, hogy fut-e
ps aux | grep node
```

### 11. Ellenőrzés

```bash
# Ellenőrizd, hogy a szerver válaszol-e
curl http://localhost:4000/install 2>&1 | head -20

# Vagy ellenőrizd a logokat
tail -f nohup.out
```

## Teljes telepítési script

Mentheted ezt egy fájlba (`install.sh`) és futtathatod:

```bash
#!/bin/bash

# Building Survey - SSH Telepítési Script

set -e  # Exit on error

echo "🚀 Building Survey - SSH Telepítés"
echo "===================================="
echo ""

# 1. Navigálás
APP_DIR="/home/wpmuhel/public_html/felmeres"
cd "$APP_DIR" || exit 1
echo "✅ Könyvtár: $(pwd)"
echo ""

# 2. Import javítás
echo "🔧 Import javítása..."
if grep -q "from './auth/local'" lib/projects.ts; then
  sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
  echo "✅ Import javítva"
else
  echo "✅ Import már helyes"
fi
echo ""

# 3. Node.js verzió ellenőrzése
echo "📦 Node.js verzió ellenőrzése..."
NODE_VERSION_FULL=$(node -v 2>/dev/null || echo "NOT_FOUND")
if [ "$NODE_VERSION_FULL" == "NOT_FOUND" ]; then
  echo "❌ Node.js nem található!"
  exit 1
fi
NODE_VERSION=$(echo $NODE_VERSION_FULL | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js verzió túl régi: $NODE_VERSION_FULL"
  echo "⚠️  Node.js 18+ szükséges!"
  echo "📝 Javaslat: Használd a CWP7 Node.js Selector-t vagy NVM-et"
  echo "   CWP7 panel: Node.js Selector -> válassz Node.js 18+ verziót"
  exit 1
else
  echo "✅ Node.js verzió OK: $NODE_VERSION_FULL"
fi
echo ""

# 4. Függőségek
echo "📦 Függőségek telepítése..."
rm -rf node_modules
npm install
echo "✅ Függőségek telepítve"
echo ""

# 5. Build cache törlése
echo "🧹 Build cache törlése..."
rm -rf .next
echo "✅ Cache törölve"
echo ""

# 6. Build
echo "🔨 Build futtatása..."
npm run build
echo "✅ Build sikeres"
echo ""

# 7. Build ellenőrzés
if [ -f ".next/BUILD_ID" ]; then
  echo "✅ BUILD_ID létrejött: $(cat .next/BUILD_ID)"
else
  echo "❌ BUILD_ID nem található!"
  exit 1
fi
echo ""

# 8. Kész
echo "✅ Telepítés befejezve!"
echo ""
echo "Indítás: npm start"
echo "Port: 4000 (vagy a beállított port)"
```

## Használat

### Opció 1: Automatikus telepítési script (AJÁNLOTT)

```bash
# Ha feltöltötted az INSTALL_FRESH.sh fájlt:
cd /home/wpmuhel/public_html/felmeres
chmod +x INSTALL_FRESH.sh
./INSTALL_FRESH.sh
```

Ez a script automatikusan:
- ✅ Ellenőrzi a Node.js verziót
- ✅ Javítja az importot ha szükséges
- ✅ Telepíti a függőségeket
- ✅ Törli a build cache-t
- ✅ Buildeli az alkalmazást

### Opció 2: Manuális lépések

```bash
# Navigálás
cd /home/wpmuhel/public_html/felmeres

# Node.js verzió ellenőrzés
node -v  # Legyen 18+ (pl. v22.21.1)

# Import javítás (ha szükséges)
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts

# Függőségek
rm -rf node_modules
npm install

# Build cache törlése
rm -rf .next

# Build
npm run build

# Ellenőrzés
ls -la .next/BUILD_ID  # Léteznie kell
```

## Hibaelhárítás

### Node.js verzió túl régi (v14 vagy régebbi)

**Probléma:** `node -v` v14.15.3 vagy régebbi verziót mutat.

**Megoldás:**

1. **CWP7 Node.js Selector (AJÁNLOTT):**
   - Lépj be a CWP7 panelbe
   - Nyisd meg a "Node.js Selector" opciót
   - Válaszd ki a Node.js 18+ verziót (pl. v18.17.0, v20.x.x, v22.x.x)
   - Állítsd be az alkalmazás könyvtárát: `/home/wpmuhel/public_html/felmeres`
   - Mentsd el
   - SSH-n keresztül ellenőrizd: `node -v` (most már 18+-nak kell lennie)

2. **NVM használata (ha CWP7 Selector nem elérhető):**
   ```bash
   # NVM telepítése (ha nincs)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   
   # Node.js 18 telepítése
   nvm install 18
   nvm use 18
   nvm alias default 18
   
   # Ellenőrzés
   node -v
   ```

3. **Ellenőrzés:**
   ```bash
   node -v
   # Eredménynek így kell kinéznie: v18.x.x vagy v20.x.x vagy v22.x.x
   ```

### Build hiba: Cannot find module './auth/local'

```bash
# Javítsd az importot
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts

# Ellenőrizd
grep -n "from.*auth/local" lib/projects.ts
```

### ChunkLoadError

```bash
# Töröld a cache-t és újra buildelj
rm -rf .next
npm run build
npm start
```

### Port már foglalt

```bash
# Ellenőrizd, hogy mi használja a portot
lsof -i :4000
# vagy
netstat -tulpn | grep 4000

# Állítsd meg a folyamatot, vagy változtasd meg a portot
```

### BUILD_ID hiányzik

```bash
# Ellenőrizd, hogy a build sikeres volt-e
ls -la .next/

# Ha nincs BUILD_ID, újra buildelj
rm -rf .next
npm run build
```

## Ellenőrző lista

- [ ] SSH kapcsolat létrejött
- [ ] Megfelelő könyvtárban vagy (`pwd`)
- [ ] `package.json` létezik
- [ ] `lib/projects.ts` import helyes (`@/lib/auth/local`)
- [ ] Node.js 18+ telepítve
- [ ] `npm install` sikeres
- [ ] `.next` mappa törölve
- [ ] `npm run build` sikeres
- [ ] `.next/BUILD_ID` létezik
- [ ] `npm start` fut
- [ ] Az alkalmazás elérhető a böngészőben

