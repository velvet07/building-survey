# cPanel Telepítési Útmutató

Ez az útmutató segít a Building Survey alkalmazás telepítésében cPanel környezetben.

## Előfeltételek

1. **Node.js**: cPanel Node.js Selector-ben válaszd ki a Node.js 18+ verziót
2. **MySQL/MariaDB adatbázis**: Hozd létre a webhosting panelben
3. **Fájl feltöltés**: FTP vagy File Manager használatával

## Telepítési lépések

### 1. Fájlok feltöltése

**FONTOS:** A projekt `deploy/` mappájában található az összes telepítendő fájl.

Töltsd fel a `deploy/` mappa **tartalmát** (nem a mappát magát!) a webhosting könyvtáradba (pl. `public_html` vagy `subdomain` könyvtár).

**Példa:**
- Helyi: `building-survey/deploy/*`
- Szerver: `public_html/` vagy `subdomain/`

### 2. MySQL adatbázis létrehozása

**FONTOS:** Az adatbázist előre létre kell hozni a cPanel-ben!

1. Lépj be a cPanel-be
2. Nyisd meg a "MySQL Databases" opciót
3. Hozz létre egy új adatbázist (pl. `building_survey`)
4. Hozz létre egy adatbázis felhasználót
5. Add hozzá a felhasználót az adatbázishoz (ALL PRIVILEGES jogosultsággal)
6. Jegyezd fel az adatbázis nevét, felhasználónevet és jelszót

### 3. Node.js beállítása

1. Nyisd meg a cPanel Node.js Selector-t
2. Válaszd ki a Node.js 18+ verziót
3. Állítsd be az alkalmazás könyvtárát
4. Indítsd el az alkalmazást

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
- Ellenőrizd, hogy az alkalmazás elindult-e a Node.js Selector-ben

### Fájl jogosultságok

- Ellenőrizd, hogy a `uploads` könyvtár írható-e (755 vagy 777 jogosultság)

