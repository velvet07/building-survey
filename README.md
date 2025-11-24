# 🏗️ Épületfelmérő Rendszer

Moduláris webalkalmazás épületfelméréshez és építési dokumentációhoz. Teljes projektek kezelése, rajzolás, űrlapok és fotók - mindezt self-hosted MySQL/MariaDB adatbázissal, cPanel/CWP7 környezetben futtatható.

**Verzió:** 2.0.0
**Status:** ✅ Production Ready
**Branch:** `self-hosted-mysql-installer`

---

## ✨ Funkciók

### 🔐 Felhasználó kezelés
- **3 szerepkör**: Admin, User, Viewer
- Email/jelszó alapú helyi autentikáció (bcrypt)
- Session-alapú bejelentkezés
- Admin panel felhasználó létrehozáshoz/szerkesztéshez

### 📁 Projektek
- Projekt létrehozás, szerkesztés, törlés
- Automatikus azonosító generálás (pl. `PROJ-20251025-001`)
- Soft delete (visszaállítható törlés)

### 🖊️ Rajzmodul
- Canvas rajzolás (toll, radír, kijelölés)
- A4/A3 papírméret, álló/fekvő
- Touch gestures (pinch-to-zoom, two-finger pan)
- PDF export
- User-friendly URL-ek (pl. `/alaprajz-pince`)

### 📋 Űrlapok
- Dinamikus űrlapok (Aquapol modul)
- Automatikus mentés
- Megtekintő mód (Viewer role)

### 📷 Fotógaléria
- **Lokális file storage**
- Automatikus thumbnail generálás
- Galéria nézet
- Letöltés, törlés

---

## 🚀 Telepítés

### Előfeltételek

- **Node.js 18+** telepítve
- **MySQL/MariaDB adatbázis** létrehozva a webhosting panelben
- **Fájl feltöltés** lehetőség (FTP/File Manager)
- **cPanel vagy CWP7** környezet (opcionális, de ajánlott)

### Telepítési lépések

**📖 Részletes telepítési útmutatók:**
- **[INSTALL_CPANEL.md](./INSTALL_CPANEL.md)** - cPanel telepítési útmutató
- **[INSTALL_CWP7.md](./INSTALL_CWP7.md)** - CWP7 telepítési útmutató

**Rövid verzió:**

1. **Fájlok feltöltése** (FTP/File Manager)
2. **MySQL adatbázis létrehozása** a webhosting panelben
3. **Node.js beállítása** (cPanel Node.js Selector vagy CWP7)
4. **Webes installer futtatása**: `https://your-domain.com/install`
5. **Telepítés befejezése** az installer-ben:
   - Adatbázis kapcsolódási adatok megadása
   - Modulok kiválasztása
   - Admin felhasználó létrehozása

**Fontos:** Az adatbázist előre létre kell hozni a webhosting panelben! Az installer csak kapcsolódik a meglévő adatbázishoz.

---

## 🛠️ Technológiai stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js Server Actions, API Routes
- **Adatbázis**: MySQL/MariaDB
- **Autentikáció**: Helyi session-alapú (bcrypt)
- **Styling**: Tailwind CSS
- **Rajzolás**: Konva.js, React Konva
- **PDF**: jsPDF

---

## 📚 Dokumentáció

### Telepítés
- **[INSTALL_CPANEL.md](./INSTALL_CPANEL.md)** - cPanel telepítési útmutató
- **[INSTALL_CWP7.md](./INSTALL_CWP7.md)** - CWP7 telepítési útmutató

### Fejlesztői dokumentáció
- **[DEVELOPER.md](./DEVELOPER.md)** - Fejlesztői útmutató (frissítés szükséges)

---

## 🔧 Konfiguráció

Az alkalmazás a `.env` fájlból olvassa be a konfigurációt:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=building_survey
DB_USER=username
DB_PASSWORD=password

# Database URL
DATABASE_URL=mysql://username:password@localhost:3306/building_survey

# App
NEXT_PUBLIC_APP_URL=http://your-domain.com
NODE_ENV=production

# Session
SESSION_SECRET=random-secret-key-here

# File Upload
UPLOAD_DIR=./uploads
```

**Megjegyzés:** Az installer automatikusan létrehozza a `.env` fájlt a telepítés során.

---

## 🔐 Biztonság

- **Jelszó hashing**: bcrypt (10 salt rounds)
- **Session kezelés**: HTTP-only cookies
- **SQL injection védelem**: Paraméterezett lekérdezések
- **XSS védelem**: Next.js beépített védelem
- **CSRF védelem**: SameSite cookie policy

---

## 📝 Licenc

ISC

---

## 🤝 Közreműködés

Pull requesteket szívesen fogadunk! Nagyobb változtatások esetén kérjük, először nyiss egy issue-t a változtatás leírásával.

---

## 📞 Támogatás

Problémák esetén nyiss egy issue-t a GitHub-on.
