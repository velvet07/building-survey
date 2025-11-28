# 🚀 Building Survey - Teljes Telepítési Útmutató

## ⚠️ FONTOS INFORMÁCIÓK

### Jelenlegi Hibák és Megoldások

#### 1. Build hibák - "Dynamic server usage" error
**Probléma:** A Next.js megpróbálja statikusan renderelni az API route-okat, de azok cookie-kat használnak.

**Megoldás:** ✅ JAVÍTVA - Minden API route-hoz hozzáadtuk az `export const dynamic = 'force-dynamic'` direktívát.

#### 2. Port már használatban - "EADDRINUSE"
**Probléma:** A 4000-es port már foglalt egy régi példány miatt.

**Megoldás:** A `SERVER_COMPLETE_FIX.sh` script automatikusan leállítja a régi példányokat.

#### 3. Adatbázis kapcsolat
**Probléma:** Az alkalmazás nem próbál csatlakozni az adatbázishoz.

**Megoldás:** A `/install` oldalon kell beállítani az adatbázis kapcsolatot, amely automatikusan létrehozza a `.env` fájlt.

---

## 📦 Előfeltételek

### Szerver követelmények
- ✅ Node.js 18+ (jelenleg: 22.21.1 ✓)
- ✅ MySQL/MariaDB adatbázis
- ✅ SSH hozzáférés
- ✅ Port 4000 elérhető

### Adatbázis követelmények
- Adatbázis neve: `wpmuhel_felmeres` (vagy egyéb)
- Felhasználó: `wpmuhel_felmeres` (vagy egyéb)
- Jelszó: Az adatbázis jelszava
- Jogosultságok: `CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT`

---

## 🎯 Gyors Telepítés (Ajánlott)

### 1. Fájlok feltöltése

```bash
# SSH-n keresztül
cd /home/wpmuhel/public_html

# Ha már van felmeres mappa, töröld vagy nevezd át
mv felmeres felmeres_backup_$(date +%Y%m%d_%H%M%S)

# Másold fel a deploy mappa tartalmát
# (használj FileZilla, WinSCP vagy rsync-et)
```

### 2. Jogosultságok beállítása

```bash
cd /home/wpmuhel/public_html/felmeres
chmod +x *.sh
chmod +x deploy/*.sh 2>/dev/null || true
```

### 3. Automatikus telepítés

```bash
# Futtasd az all-in-one telepítő scriptet
./SERVER_COMPLETE_FIX.sh
```

Ez a script:
- ✅ Ellenőrzi a Node.js verziót
- ✅ Leállítja a régi példányokat
- ✅ Törli a cache-t
- ✅ Telepíti a függőségeket
- ✅ Buildeli az alkalmazást
- ✅ Elindítja az alkalmazást
- ✅ Health check-et futtat

### 4. Alkalmazás konfiguráció

Nyisd meg a böngészőben:
```
https://felmeres.wpmuhely.com/install
```

Add meg az adatbázis adatokat:
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `wpmuhel_felmeres`
- **Username:** `wpmuhel_felmeres`
- **Password:** `[az adatbázis jelszava]`

Válaszd ki a szükséges modulokat és hozd létre az admin felhasználót.

---

## 🔧 Manuális Telepítés (Ha az automatikus nem működik)

### 1. Node.js verzió ellenőrzés

```bash
node -v
# Eredmény: v22.21.1 vagy újabb
```

Ha régebbi, állítsd be a CWP7 Node.js Selector-ban.

### 2. Régi példányok leállítása

```bash
# Port alapján
lsof -i :4000
# Jegyezd fel a PID-t, majd:
kill -9 [PID]

# VAGY használd a STOP script-et
chmod +x STOP_APP.sh
./STOP_APP.sh
```

### 3. Cache törlése

```bash
rm -rf .next
rm -rf node_modules
```

### 4. Függőségek telepítése

```bash
npm install
```

### 5. Build

```bash
npm run build
```

**Várható kimenet:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (23/23)
✓ Finalizing page optimization
```

Ha hibát kapsz, ellenőrizd:
- Node.js verzió 18+
- Nincs szintaxis hiba a kódban
- Az összes függőség telepítve van

### 6. Alkalmazás indítása

```bash
# Háttérben (nohup)
nohup npm start > /dev/null 2>&1 &
echo $! > app.pid

# VAGY PM2-vel (ha telepítve van)
pm2 start npm --name "building-survey" -- start
pm2 save
```

### 7. Ellenőrzés

```bash
# Health check
curl http://localhost:4000/api/health

# Logok
tail -f nohup.out
# vagy PM2-vel:
pm2 logs building-survey
```

---

## 🐛 Hibaelhárítás

### Build hibák

#### "Dynamic server usage" error
**Tünet:**
```
Error getting session: Route /api/debug couldn't be rendered statically because it used `cookies`
```

**Megoldás:**
✅ Ez már javítva van! Az új deploy mappában minden API route-nak megvan az `export const dynamic = 'force-dynamic'` direktívája.

Ha mégis előfordul, ellenőrizd:
```bash
# Ellenőrizd az API route-okat
grep -r "export const dynamic" app/api/
```

#### "Cannot find module" error
**Megoldás:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Port foglalt

#### "EADDRINUSE: address already in use :::4000"
**Megoldás 1 - Automatikus:**
```bash
./STOP_APP.sh
```

**Megoldás 2 - Manuális:**
```bash
# Keresd meg a folyamatot
lsof -i :4000
netstat -tlnp | grep 4000
ps aux | grep "next start"

# Állítsd le
kill -9 [PID]
```

**Megoldás 3 - CWP7 Panel:**
- Node.js Selector → STOP gomb
- Várj 5 másodpercet
- START gomb

### Adatbázis kapcsolat

#### "Cannot connect to database"
**Ellenőrzés:**
```bash
# MySQL service fut?
systemctl status mariadb
# vagy
service mysql status

# Kapcsolódás tesztelése
mysql -h localhost -u wpmuhel_felmeres -p wpmuhel_felmeres
```

**Megoldás:**
1. Ellenőrizd az adatbázis adatokat a CWP7/cPanel-ben
2. Futtasd újra a `/install` oldalt
3. vagy manuálisan hozd létre a `.env` fájlt:

```bash
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wpmuhel_felmeres
DB_USER=wpmuhel_felmeres
DB_PASSWORD=ITT_A_JELSZÓ

DATABASE_URL=mysql://wpmuhel_felmeres:ITT_A_JELSZÓ@localhost:3306/wpmuhel_felmeres

NEXT_PUBLIC_APP_URL=https://felmeres.wpmuhely.com
NODE_ENV=production

SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

UPLOAD_DIR=./uploads
EOF
```

#### "INSTALL_LOCK" hiba
Ha a `/install` oldal átirányít a főoldalra:

```bash
# Töröld az install lock fájlt
rm -f app/install/INSTALL_LOCK

# Indítsd újra
./RESTART_APP.sh
```

---

## 📋 Hasznos Parancsok

### Alkalmazás kezelés

```bash
# Újraindítás
./RESTART_APP.sh

# Leállítás
./STOP_APP.sh

# Státusz
ps aux | grep next
# vagy PM2-vel:
pm2 status

# Logok megtekintése
tail -f nohup.out
# vagy PM2-vel:
pm2 logs building-survey
```

### Adatbázis

```bash
# Belépés MySQL-be
mysql -u wpmuhel_felmeres -p wpmuhel_felmeres

# Táblák listázása
SHOW TABLES;

# Felhasználók listázása
SELECT id, email, role FROM profiles;

# Projektek listázása
SELECT id, name, owner_id FROM projects;
```

### Fájlok és jogosultságok

```bash
# Uploads mappa jogosultságok
chmod 755 uploads
chmod 755 uploads/thumbnails

# Build mappa ellenőrzés
ls -la .next/

# Build ID
cat .next/BUILD_ID
```

---

## 🔄 Frissítés

Amikor új verziót töltesz fel:

```bash
# 1. Állítsd le az alkalmazást
./STOP_APP.sh

# 2. Mentsd az uploads mappát
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# 3. Mentsd a .env fájlt
cp .env .env.backup

# 4. Töröld a régi fájlokat (kivéve uploads és .env)
rm -rf app components lib .next node_modules *.js *.ts *.json

# 5. Töltsd fel az új fájlokat

# 6. Állítsd vissza a .env-t
cp .env.backup .env

# 7. Futtasd a telepítőt
./SERVER_COMPLETE_FIX.sh
```

---

## ✅ Telepítés Ellenőrző Lista

- [ ] Node.js 18+ telepítve és beállítva
- [ ] MySQL adatbázis létrehozva (név, user, jelszó)
- [ ] Deploy mappa feltöltve a szerverre
- [ ] Scriptek futtathatóak (`chmod +x *.sh`)
- [ ] `SERVER_COMPLETE_FIX.sh` lefuttatva
- [ ] Build sikeres (nincs hiba)
- [ ] Alkalmazás fut (port 4000)
- [ ] `/install` oldal elérhető
- [ ] Adatbázis beállítások megadva
- [ ] Admin felhasználó létrehozva
- [ ] Bejelentkezés sikeres
- [ ] Projekt létrehozás működik

---

## 📞 Támogatás

Ha problémád van:

1. Ellenőrizd a logokat: `tail -f nohup.out` vagy `pm2 logs`
2. Futtasd újra: `./SERVER_COMPLETE_FIX.sh`
3. Próbáld manuálisan a fenti lépéseket
4. Ellenőrizd az adatbázis kapcsolatot

---

## 📝 Megjegyzések

- Az alkalmazás a 4000-es porton fut belsőleg
- A webszerver (Apache/Nginx) proxyzza a külső URL-re
- Az uploads mappa lokálisan tárolódik (nem Supabase)
- A session adatok cookie-ban vannak
- Az installer csak egyszer futtatható (INSTALL_LOCK miatt)

---

**Utolsó frissítés:** 2025-11-28
**Verzió:** 1.2.0
**Státusz:** Éles, tesztelt
