# Deployment útmutató - Production Server

## Frissítések feltöltése

1. **Fájlok feltöltése a deploy/ mappából:**
   - `deploy/app/` → szerveroldali `/app/`
   - `deploy/lib/` → szerveroldali `/lib/`
   - `deploy/database/` → szerveroldali `/database/`
   - `deploy/ecosystem.config.js` → szerveroldali `/`

2. **Build készítése a szerveren:**
   ```bash
   cd /path/to/your/app
   npm run build
   ```

3. **PM2 újraindítása:**
   ```bash
   pm2 restart ecosystem.config.js
   # VAGY ha még nincs elindítva:
   pm2 start ecosystem.config.js
   pm2 save
   ```

## PM2 használata (FONTOS!)

### Miért PM2?
Az SSH ablak bezárásakor a sima `npm start` leállítja a Node.js folyamatot. A PM2 process manager biztosítja, hogy:
- ✅ A folyamat fut SSH nélkül is
- ✅ Automatikus újraindítás hiba esetén
- ✅ Log fájlok tárolása
- ✅ Memória limit kezelés

### PM2 parancsok

**Elindítás:**
```bash
pm2 start ecosystem.config.js
pm2 save  # Mentés, hogy boot után is elinduljon
```

**Státusz ellenőrzés:**
```bash
pm2 status
pm2 list
```

**Logok megtekintése:**
```bash
pm2 logs building-survey
pm2 logs building-survey --lines 100
```

**Újraindítás változtatások után:**
```bash
pm2 restart building-survey
# VAGY
pm2 restart ecosystem.config.js
```

**Leállítás:**
```bash
pm2 stop building-survey
pm2 delete building-survey  # Eltávolítás a PM2-ből
```

**PM2 automatikus indítás rendszer bootkor:**
```bash
pm2 startup
# Futtasd a parancsot amit a pm2 startup kiír!
pm2 save
```

## Javított hibák

### 2025-01-29

**1. MySQL RETURNING klauzula hiba**
- **Probléma:** MariaDB/MySQL nem támogatja a PostgreSQL-es `RETURNING` klauzulát
- **Érintett fájlok:** `app/actions/users.ts`
- **Javítás:** UPDATE/DELETE után külön SELECT query-vel olvassuk vissza az adatokat

**2. Server Component fetch hiba**
- **Probléma:** `lib/auth.ts` getUserRole() függvény fetch()-et használt server component-ben
- **Javítás:** Eltávolítva, használjuk a `getCurrentUserRoleAction()` server action-t helyette

**3. Installer hibák**
- **DELIMITER blokkok:** Eltávolítva, trigger-ek programozottan jönnek létre
- **Admin user creation:** Installer saját connection-jét használja, nem a lib/db-t
- **Duplicate entry kezelés:** Graceful error handling újratelepítéskor

## Telepítés nulláról

1. **Node.js 22+ telepítése NVM-mel:**
   ```bash
   nvm install 22
   nvm use 22
   ```

2. **PM2 globális telepítése:**
   ```bash
   npm install -g pm2
   ```

3. **Függőségek telepítése:**
   ```bash
   npm install
   ```

4. **Build készítése:**
   ```bash
   npm run build
   ```

5. **Adatbázis telepítése:**
   - Böngészőben: `https://felmeres.wpmuhely.com/install`
   - Töltsd ki az adatbázis adatokat
   - Válaszd ki a modulokat
   - Hozd létre az admin felhasználót

6. **Alkalmazás indítása PM2-vel:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Majd futtasd a parancsot amit kiír
   ```

## Troubleshooting

### Nem érhető el az oldal
```bash
pm2 status  # Ellenőrizd hogy fut-e
pm2 logs building-survey  # Nézd meg a hibákat
```

### Database connection error
- Ellenőrizd hogy a `.env` fájl létezik és helyes adatokat tartalmaz
- Ellenőrizd hogy a MySQL fut: `systemctl status mariadb`

### Build hiba
```bash
rm -rf .next
npm run build
```

### PM2 nem indul automatikusan boot után
```bash
pm2 unstartup  # Töröld a régit
pm2 startup    # Hozz létre újat
# Futtasd a parancsot amit kiír
pm2 save
```

## Konfiguráció

### Port változtatás
`ecosystem.config.js` fájlban:
```javascript
env: {
  PORT: 3000,  // Változtasd erre
}
```

### Memória limit változtatás
```javascript
max_memory_restart: '1G',  // Növeld ha szükséges
```

### További instance-ok (clustering)
```javascript
instances: 4,  // CPU magok száma
exec_mode: 'cluster',
```
