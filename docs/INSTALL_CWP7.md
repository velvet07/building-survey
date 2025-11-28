# CWP7 Telepítési Útmutató

Ez az útmutató segít a Building Survey alkalmazás telepítésében CWP7 (CentOS Web Panel) környezetben.

**SSH telepítéshez:** Lásd a `deploy/INSTALL_SSH.md` fájlt részletes SSH útmutatóért.

## Előfeltételek

1. **Node.js**: Node.js 18+ telepítve
2. **MySQL/MariaDB adatbázis**: Hozd létre a CWP7 panelben
3. **Fájl feltöltés**: FTP vagy File Manager használatával

## Telepítési lépések

### 1. Fájlok feltöltése

**FONTOS:** A projekt `deploy/` mappájában található az összes telepítendő fájl.

Töltsd fel a `deploy/` mappa **tartalmát** (nem a mappát magát!) a webhosting könyvtáradba (pl. `public_html` vagy `subdomain` könyvtár).

**Példa:**
- Helyi: `building-survey/deploy/*`
- Szerver: `public_html/` vagy `subdomain/`

### 2. MySQL adatbázis létrehozása

**FONTOS:** Az adatbázist előre létre kell hozni a CWP7 panelben!

1. Lépj be a CWP7 panelbe
2. Nyisd meg a "MySQL Databases" opciót
3. Hozz létre egy új adatbázist (pl. `building_survey`)
4. Hozz létre egy adatbázis felhasználót
5. Add hozzá a felhasználót az adatbázishoz (ALL PRIVILEGES jogosultsággal)
6. Jegyezd fel az adatbázis nevét, felhasználónevet és jelszót

### 3. Node.js beállítása

1. Nyisd meg a CWP7 Node.js Selector-t
2. Válaszd ki a Node.js 18+ verziót
3. Állítsd be az alkalmazás könyvtárát
4. **Függőségek telepítése:**
   - **FONTOS:** Győződj meg róla, hogy az alkalmazás könyvtárában vagy (ahol a `package.json` van)!
   - Futtasd le: `npm install`
   - Ez telepíti az összes függőséget, beleértve a TypeScript típusdefiníciókat is
   - Várj a telepítés befejezésére
5. **Build futtatása (KÖTELEZŐ!):**
   - **FONTOS:** Ugyanabban a könyvtárban futtasd, ahol a `package.json` van!
   - Futtasd le: `npm run build`
   - Várj a build befejezésére (ez eltarthat néhány percig)
   - **Ellenőrizd a build kimenetét:** Ha hibát látsz, jegyezd fel!
   - A build létrehozza a `.next` mappát a `BUILD_ID` fájllal
   - **SSH ellenőrzés (ha van hozzáférés):**
     ```bash
     # Ellenőrizd, hogy létrejött-e a BUILD_ID
     ls -la .next/BUILD_ID
     cat .next/BUILD_ID
     ```
   - **FONTOS:** A `next start` csak build után működik!
6. **Alkalmazás indítása:**
   - **FONTOS:** Ugyanabban a könyvtárban futtasd, ahol a `package.json` és a `.next` mappa van!
   - Futtasd le: `npm start`
   - Az alkalmazás a 4000-es porton indul el
   - **Ellenőrzés:** Ha hiba van, hogy nincs BUILD_ID, akkor a build nem a megfelelő könyvtárban futott le
7. **CWP7 Node.js Selector beállítások:**
   - **Application Root:** Állítsd be az alkalmazás könyvtárát (ahol a `package.json` van)
   - **Startup File:** `package.json`
   - **Startup Command:** `npm start` (vagy hagyd üresen, ha automatikus)
   - **PORT:** A `package.json` start scriptje már be van állítva a 4000-es portra
   - Ha más portot használsz, módosítsd a `package.json`-ban: `"start": "next start -p [PORT]"`
8. Indítsd el az alkalmazást a CWP7 Node.js Selector-ben

### 4. Webes installer futtatása

1. Nyisd meg a böngészőben: `https://your-domain.com/install`
2. Kövesd az installer lépéseit:
   - Adatbázis kapcsolódási adatok megadása
   - Modulok kiválasztása
   - Admin felhasználó létrehozása
3. Várj a telepítés befejezésére

### 5. Telepítés után

Az installer automatikusan:
- Létrehozza a `.env` fájlt
- Telepíti az adatbázis sémát
- Létrehozza az admin felhasználót
- Zárolja az installer-t (`INSTALL_LOCK` fájl)

## Hibaelhárítás

### Adatbázis kapcsolódási hiba

- Ellenőrizd, hogy az adatbázis létezik-e
- Ellenőrizd a felhasználónevet és jelszót
- Ellenőrizd, hogy a felhasználó hozzá van-e rendelve az adatbázishoz

### Node.js hiba

- Ellenőrizd, hogy a Node.js verzió 18+
- Ellenőrizd, hogy az alkalmazás elindult-e
- **TypeScript hiba (Could not find a declaration file for module 'bcryptjs'):**
  - Futtasd le: `npm install` (ez telepíti a `@types/bcryptjs` package-t)
  - Ezután futtasd újra: `npm run build`
- **Build hiba (Could not find a production build / BUILD_ID hiányzik):**
  - **FONTOS:** Győződj meg róla, hogy ugyanabban a könyvtárban vagy, ahol a `package.json` van!
  - **SSH ellenőrzés (ha van hozzáférés):**
    ```bash
    # 1. Ellenőrizd a jelenlegi könyvtárat
    pwd
    
    # 2. Ellenőrizd, hogy létezik-e a .next mappa
    ls -la .next/
    
    # 3. Ellenőrizd, hogy létezik-e a BUILD_ID fájl
    ls -la .next/BUILD_ID
    cat .next/BUILD_ID
    
    # 4. Ha nincs BUILD_ID, nézd meg mi van a .next mappában
    ls -la .next/
    
    # 5. Futtasd le az ellenőrző scriptet (ha feltöltötted)
    node check-build.js
    ```
  - **Lehetséges okok:**
    - A build nem fejeződött be teljesen (nézd meg a build kimenetét hibákért)
    - A build másik könyvtárban futott le
    - A `next.config.js` standalone módja problémát okoz (CWP7-nél nem kell)
  - **Megoldás:**
    - Futtasd le újra: `npm run build` (ugyanabban a könyvtárban!)
    - Figyeld meg a build kimenetét, keress hibákat
    - Ha a build sikeres, de nincs BUILD_ID, próbáld meg a standalone módot kikapcsolni a `next.config.js`-ben
    - Csak build után futtasd: `npm start` (ugyanabban a könyvtárban!)
  - **Tipp:** A CWP7 Node.js Selector-ben ellenőrizd, hogy az "Application Root" mező pontosan az alkalmazás könyvtárát mutatja-e
- **Port hiba (EADDRINUSE: address already in use :::3000):**
  - A `package.json` start scriptje már be van állítva a 4000-es portra
  - Ha más portot használsz, módosítsd a `package.json`-ban: `"start": "next start -p [PORT]"`
- **Végtelen ciklus / Middleware hiba:**
  - Ha a szerver végtelen ciklusba fut vagy nem válaszol, a middleware lehet a probléma
  - A middleware Edge Runtime-kompatibilis verziója már benne van a kódban
  - Ha még mindig probléma van, ellenőrizd, hogy a `middleware.ts` fájl friss-e
  - **Megoldás:** Töltsd fel a frissített `middleware.ts` fájlt, majd futtasd újra: `npm run build` és `npm start`
- **TypeScript import hiba (Cannot find module './auth/local'):**
  - Ha a build során import hibát kapsz, a `lib/projects.ts` fájlban rossz az import útvonal
  - **Gyors javítás (SSH-n keresztül):**
    ```bash
    # 1. Futtasd le a fix scriptet (ha feltöltötted)
    chmod +x fix-import.sh
    ./fix-import.sh
    
    # VAGY manuálisan javítsd:
    sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts
    
    # 2. Ellenőrizd, hogy helyesen van-e javítva
    grep -n "from.*auth/local" lib/projects.ts
    # A kimenetnek így kell kinéznie:
    # 8:import { getSession } from '@/lib/auth/local';
    
    # 3. Töröld a build cache-t
    rm -rf .next
    
    # 4. Újra buildelés
    npm run build
    ```
  - **FONTOS:** A `lib/projects.ts` fájl 8. sorában `@/lib/auth/local` kell legyen, ne `./auth/local`!
  - **Ha a fájl nem lett feltöltve:** Töltsd fel újra a `deploy/lib/projects.ts` fájlt a szerverre

### Fájl jogosultságok

- Ellenőrizd, hogy a `uploads` könyvtár írható-e (755 vagy 777 jogosultság)

