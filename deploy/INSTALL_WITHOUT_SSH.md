# 🌐 Building Survey - Telepítés SSH nélkül

## 📋 Áttekintés

Ez az útmutató megmutatja, hogyan telepítheted az alkalmazást **SSH hozzáférés nélkül**, csak FTP és webböngésző segítségével.

---

## 🎯 Két telepítési mód

### 🚀 1. Mód: Web-alapú telepítő (AJÁNLOTT)
- ✅ Egyszerű, grafikus felület
- ✅ Lépésről lépésre vezet
- ✅ Automatikus ellenőrzések
- ⏱️ Időigény: 10-15 perc

### 🔧 2. Mód: cPanel/CWP7 Terminal
- ✅ Gyorsabb
- ⚠️ Szükséges: cPanel Terminal hozzáférés
- ⏱️ Időigény: 5-10 perc

---

## 🚀 1. Mód: Web-alapú telepítő (Részletes útmutató)

### Lépés 1: Fájlok feltöltése FTP-vel

#### 1.1. FTP program telepítése

Töltsd le és telepítsd a **FileZilla**-t:
- Windows: https://filezilla-project.org/download.php?type=client
- Mac: https://filezilla-project.org/download.php?type=client

Vagy használd a **WinSCP**-t (csak Windows):
- https://winscp.net/eng/download.php

#### 1.2. Csatlakozás a szerverhez

**FileZilla:**
```
Host: felmeres.wpmuhely.com (vagy az FTP szerver címe)
Username: [FTP felhasználónév]
Password: [FTP jelszó]
Port: 21
```

**cPanel FTP adatok megtalálása:**
1. Lépj be a cPanel-be
2. Keresd meg az "FTP Accounts" menüpontot
3. Ha nincs FTP fiók, hozz létre egyet

#### 1.3. Fájlok feltöltése

1. **Bal oldal:** Nyisd meg a `deploy/` mappát a számítógépeden
2. **Jobb oldal:** Navigálj a `/home/wpmuhel/public_html/felmeres/` mappába
3. **Töltsd fel az ÖSSZES fájlt és mappát:**
   - ✅ app/
   - ✅ components/
   - ✅ lib/
   - ✅ database/
   - ✅ config/
   - ✅ public/
   - ✅ node_modules/ (NE töltsd fel - majd a szerveren lesz telepítve)
   - ✅ .next/ (NE töltsd fel - majd a szerveren lesz buildelve)
   - ✅ package.json
   - ✅ package-lock.json
   - ✅ next.config.js
   - ✅ tailwind.config.ts
   - ✅ postcss.config.js
   - ✅ tsconfig.json
   - ✅ middleware.ts
   - ✅ **install-web.php** (FONTOS!)
   - ✅ SERVER_COMPLETE_FIX.sh
   - ✅ RESTART_APP.sh
   - ✅ STOP_APP.sh

**⏱️ Időigény:** 5-10 perc (az internet sebességtől függően)

**💡 Tipp:** Ne töltsd fel a `node_modules/` és `.next/` mappákat - ezek úgyis újra lesznek generálva.

#### 1.4. Jogosultságok beállítása (FileZilla)

Jobb klikk a `.sh` fájlokon → File Permissions → 755 (rwxr-xr-x)

Vagy cPanel File Manager-ben:
1. Jelöld ki a `.sh` fájlokat
2. Kattints a "Permissions" gombra
3. Állítsd be: 755

---

### Lépés 2: Web-telepítő futtatása

#### 2.1. Nyisd meg a böngészőben

```
https://felmeres.wpmuhely.com/install-web.php
```

#### 2.2. Kövesd a lépéseket

**1. lépés: Üdvözlő képernyő**
- Kattints a "Folytatás" gombra

**2. lépés: Rendszer ellenőrzés**
- ✅ Node.js verzió ellenőrzése
- ✅ Port elérhetőség
- ✅ Írható mappák

Ha Node.js hiba van:
1. Lépj be a cPanel/CWP7-be
2. Keresd meg a "Node.js Selector" vagy "Select Node.js Version" menüpontot
3. Válaszd a **Node.js 18+** verziót (ajánlott: 22.x)
4. Mentsd el
5. Frissítsd a telepítő oldalt

**3. lépés: Régi példányok leállítása**
- Ha fut régi verzió, kattints a "Alkalmazás leállítása" gombra
- Ha nem fut semmi, kattints a "Folytatás" gombra

**4. lépés: Függőségek telepítése**
- Kattints a "Telepítés indítása" gombra
- ⏱️ Várj 2-5 percet
- ✅ Zöld jelzés: Sikeres telepítés

**5. lépés: Alkalmazás build**
- Kattints a "Build indítása" gombra
- ⏱️ Várj 3-7 percet (ez a leghosszabb lépés)
- ✅ Zöld jelzés: Sikeres build

**6. lépés: Alkalmazás indítása**
- Kattints az "Indítás" gombra
- ⏱️ Várj 5-10 másodpercet
- ✅ Zöld jelzés: Alkalmazás fut

**7. lépés: Befejezés**
- ✅ Telepítés sikeres!
- Kövesse a következő lépéseket...

#### 2.3. Biztonsági lépés: install-web.php törlése

**FONTOS!** Töröld az `install-web.php` fájlt a szerverről:

**FTP-vel:**
1. Csatlakozz FTP-n
2. Keresd meg az `install-web.php` fájlt
3. Töröld

**cPanel File Manager-rel:**
1. Nyisd meg a File Manager-t
2. Navigálj a `public_html/felmeres/` mappába
3. Jelöld ki az `install-web.php` fájlt
4. Kattints a "Delete" gombra

---

### Lépés 3: Alkalmazás konfiguráció

#### 3.1. Nyisd meg az installer oldalt

```
https://felmeres.wpmuhely.com/install
```

#### 3.2. Adatbázis beállítások

Add meg a következő adatokat:

```
Host: localhost
Port: 3306
Database: wpmuhel_felmeres
Username: wpmuhel_felmeres
Password: [az adatbázis jelszava]
```

**Honnan szerezd meg az adatbázis adatokat?**

**cPanel-ben:**
1. Lépj be a cPanel-be
2. Keresd meg a "MySQL Databases" menüpontot
3. Itt láthatod az adatbázisok nevét és a felhasználókat

**CWP7-ben:**
1. Lépj be a CWP7-be
2. Keresd meg a "MySQL Management" menüpontot
3. Itt láthatod az adatbázisokat

#### 3.3. Modulok kiválasztása

Válaszd ki, mely modulokat szeretnéd használni:
- ✅ Rajzok (drawings)
- ✅ Fényképek (photos)
- ✅ Űrlapok (forms) - pl. Aquapol űrlap

#### 3.4. Admin felhasználó létrehozása

```
Email: admin@example.com
Jelszó: [biztonságos jelszó]
Teljes név: Adminisztrátor
```

**💡 Jegyezd fel ezeket az adatokat!**

#### 3.5. Telepítés befejezése

Kattints a "Telepítés befejezése" gombra.

✅ Ha minden rendben ment, átirányít a bejelentkezési oldalra.

---

### Lépés 4: Bejelentkezés és tesztelés

#### 4.1. Bejelentkezés

```
https://felmeres.wpmuhely.com/login
```

Használd az előbb létrehozott admin email címet és jelszót.

#### 4.2. Tesztelés

1. **Projekt létrehozás:** Kattints a "Új projekt" gombra
2. **Fénykép feltöltés:** Tölts fel egy tesztképet
3. **Rajz készítés:** Próbálj ki egy rajzot

---

## 🔧 2. Mód: cPanel/CWP7 Terminal

Ha van hozzáférésed a cPanel/CWP7 Terminal-hoz:

### Lépés 1: Terminal megnyitása

**cPanel:**
1. Lépj be a cPanel-be
2. Keresd meg a "Terminal" ikont
3. Kattints rá

**CWP7:**
1. Lépj be a CWP7-be
2. Keresd meg a "SSH Terminal" menüpontot

### Lépés 2: Navigálás

```bash
cd /home/wpmuhel/public_html/felmeres
```

### Lépés 3: Jogosultságok

```bash
chmod +x *.sh
```

### Lépés 4: Automatikus telepítés

```bash
./SERVER_COMPLETE_FIX.sh
```

Ez a script mindent elvégez automatikusan:
- ✅ Node.js verzió ellenőrzés
- ✅ Régi példányok leállítása
- ✅ Függőségek telepítése
- ✅ Build futtatása
- ✅ Alkalmazás indítása

### Lépés 5: Alkalmazás konfiguráció

Nyisd meg:
```
https://felmeres.wpmuhely.com/install
```

És kövesd a "Lépés 3" útmutatót fentebb.

---

## 🐛 Hibaelhárítás

### Probléma: "Node.js not found"

**Megoldás:**
1. Lépj be a cPanel/CWP7-be
2. Keresd meg a "Node.js Selector" menüpontot
3. Válaszd a Node.js 18+ verziót
4. Állítsd be az alkalmazás mappát: `/home/wpmuhel/public_html/felmeres`
5. Kattints a "Save" gombra

### Probléma: "Port already in use"

**Megoldás cPanel-ben:**
1. Keresd meg a "Node.js Selector" menüpontot
2. Kattints a "STOP" gombra
3. Várj 5 másodpercet
4. Próbáld újra

**Megoldás FTP-vel:**
1. Töltsd le a `STOP_APP.sh` fájlt
2. Futtasd a cPanel Terminal-ban:
   ```bash
   cd /home/wpmuhel/public_html/felmeres
   chmod +x STOP_APP.sh
   ./STOP_APP.sh
   ```

### Probléma: "Permission denied"

**Megoldás FTP-vel (FileZilla):**
1. Csatlakozz FTP-n
2. Jobb klikk a `.sh` fájlokon
3. File Permissions → 755
4. OK

**Megoldás cPanel File Manager-rel:**
1. Jelöld ki a `.sh` fájlokat
2. Permissions → 755
3. Change Permissions

### Probléma: "Build failed"

**Lehetséges okok:**
1. ❌ Nem minden fájl lett feltöltve
2. ❌ Node.js verzió túl régi
3. ❌ Nincs elég memória a szerveren

**Megoldás:**
1. Ellenőrizd, hogy MINDEN fájl fel lett-e töltve
2. Ellenőrizd a Node.js verziót (18+)
3. Próbáld újra: Frissítsd a web-telepítő oldalt és kattints az "Újrapróbálás" gombra

### Probléma: "Cannot connect to database"

**Megoldás:**
1. Ellenőrizd az adatbázis adatokat a cPanel/CWP7-ben
2. Bizonyosodj meg róla, hogy:
   - ✅ Az adatbázis létezik
   - ✅ A felhasználó létezik
   - ✅ A felhasználónak van joga az adatbázishoz
   - ✅ A jelszó helyes

### Probléma: Web-telepítő nem elérhető

**Ellenőrzés:**
1. Bizonyosodj meg róla, hogy az `install-web.php` fájl a szerveren van
2. Helyes URL: `https://felmeres.wpmuhely.com/install-web.php`
3. Ha 404 error: töltsd fel újra az `install-web.php` fájlt

---

## 📋 Ellenőrző lista

Mielőtt elkezded:
- [ ] FTP hozzáférésed van
- [ ] cPanel/CWP7 hozzáférésed van
- [ ] MySQL adatbázis létezik
- [ ] Node.js 18+ be van állítva a cPanel/CWP7-ben
- [ ] Letöltötted a deploy mappát

Telepítés közben:
- [ ] Összes fájl feltöltve (kivéve node_modules és .next)
- [ ] install-web.php feltöltve
- [ ] .sh fájlok jogosultságai 755
- [ ] Web-telepítő elindítva
- [ ] Mind a 7 lépés sikeresen lefutott
- [ ] install-web.php törölve a szerverről
- [ ] Installer oldal megnyitva (/install)
- [ ] Adatbázis beállítások megadva
- [ ] Admin felhasználó létrehozva

Telepítés után:
- [ ] Bejelentkezés sikeres
- [ ] Projekt létrehozható
- [ ] Fénykép feltölthető
- [ ] Rajz készíthető

---

## 🆘 Támogatás

Ha elakadtál:

1. **Olvasd el újra az útmutatót** - Lehet, hogy kihagytál egy lépést
2. **Ellenőrizd a logokat** - cPanel/CWP7 Error Logs
3. **Próbáld újra** - Sok probléma megoldódik újrapróbálással
4. **Használd a DEPLOY_COMPLETE_GUIDE.md-t** - Részletesebb hibaelhárítás

---

## 📝 Megjegyzések

### FTP feltöltési tippek

**Gyorsabb feltöltés:**
- Tömörítsd be a fájlokat .zip-be
- Töltsd fel a .zip fájlt
- Csomagold ki a cPanel File Manager-ben (Extract gomb)

**Nagy fájlok:**
- A `node_modules/` NE töltsd fel (230+ MB)
- A `.next/` NE töltsd fel
- Ezek a szerveren lesznek generálva

### cPanel Node.js Selector beállítások

```
Node.js Version: 22.x (vagy 18.x, 20.x)
Application Mode: Production
Application Root: /home/wpmuhel/public_html/felmeres
Application URL: https://felmeres.wpmuhely.com
Application Startup File: node_modules/next/dist/bin/next
```

### Port beállítások

Az alkalmazás belsőleg a **4000-es** porton fut.

**Apache proxy beállítás** (ha nincs automatikus):
```apache
ProxyPass / http://localhost:4000/
ProxyPassReverse / http://localhost:4000/
```

**Nginx proxy beállítás:**
```nginx
location / {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## ✅ Sikeres telepítés jelei

1. ✅ Web-telepítő 7. lépésig eljutott
2. ✅ install-web.php törölve
3. ✅ /install oldal elérhető
4. ✅ Adatbázis beállítások sikeresek
5. ✅ Admin felhasználó létrehozva
6. ✅ Bejelentkezés sikeres
7. ✅ Dashboard elérhető
8. ✅ Projekt létrehozható

**Gratulálunk! Az alkalmazás készen áll a használatra! 🎉**

---

**Utolsó frissítés:** 2025-11-28
**Verzió:** 1.2.0
**Támogatott platformok:** cPanel, CWP7, Plesk
