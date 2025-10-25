# Building Survey - Dokumentáció

Ez a könyvtár tartalmazza a Building Survey alkalmazás teljes dokumentációját.

## 📚 Elérhető dokumentumok

### Felhasználói dokumentáció

- **[USER_GUIDE.md](USER_GUIDE.md)** - Teljes felhasználói kézikönyv (Markdown formátum)
  - 11 fejezet
  - Részletes funkció leírások
  - Tablet használati útmutató
  - Gyakori kérdések
  - Hibaelhárítás

- **[USER_GUIDE.html](USER_GUIDE.html)** - Nyomtatható HTML verzió
  - Böngészőben megnyitható
  - Print to PDF funkcióval használható
  - Szép formázás, táblázatok, színes boxok

### PDF generálás

**Automatikus PDF generálás:**

```bash
cd docs/
./generate-pdf.sh
```

**Manuális PDF generálás (böngészőből):**

1. Nyisd meg: `USER_GUIDE.html`
2. Nyomj `Ctrl+P` (Windows/Linux) vagy `Cmd+P` (Mac)
3. Válaszd: "Print to PDF" vagy "Mentés PDF-ként"
4. Kattints a "Mentés" gombra

**Eredmény:** `USER_GUIDE.pdf` (kb. 2-3 MB)

---

## 📖 Tartalom áttekintése

### 1. Bevezetés
- Mi a Building Survey?
- Rendszerkövetelmények
- Támogatott böngészők és eszközök

### 2. Első lépések
- Bejelentkezés
- Dashboard áttekintése
- Navigáció

### 3. Felhasználói szerepkörök
- **Admin:** Teljes hozzáférés, felhasználó kezelés
- **User:** Saját projektek kezelése
- **Viewer:** Read-only hozzáférés minden projekthez

### 4. Projektek kezelése
- Projekt létrehozása
- Szerkesztés
- Állapotok (Aktív / Lezárt / Archivált)
- Törlés

### 5. Rajzok modul
- Rajzeszközök (Toll, Radír, Kijelölés, Pan)
- Rajzolás desktop-on
- Rajzolás tableten
- Zoom és navigáció
- Exportálás (PNG/PDF)

### 6. Űrlapok modul
- Aquapol űrlap kitöltése
- Mező típusok
- Automatikus mentés
- PDF exportálás

### 7. Fotók modul
- Fotó feltöltése (Drag & Drop, tallózó)
- Támogatott formátumok
- Galéria nézet
- Törlés

### 8. Felhasználók kezelése (Admin)
- Felhasználó létrehozása
- Szerepkör módosítása
- Törlés és visszaállítás

### 9. Tablet használat és ujjmozdulatok
- Alapvető ujjmozdulatok (1/2/3 ujj)
- Pinch to Zoom
- Pan (görgetés)
- Stylus/Apple Pencil/S Pen használat
- Tippek a pontosabb rajzoláshoz

### 10. Gyakori kérdések (FAQ)
- Bejelentkezés és fiók
- Projektek
- Rajzok
- Fotók
- Teljesítmény

### 11. Hibaelhárítás
- Bejelentkezési problémák
- Rajzolási problémák
- Feltöltési problémák
- Böngésző-specifikus problémák

---

## 🎯 Ki nek használja?

### Végfelhasználók
- **USER_GUIDE.md** - Könnyű keresés, GitHub-on olvasható
- **USER_GUIDE.pdf** - Nyomtatható, offline olvasható

### Adminok
- **INSTALL.md** (gyökérkönyvtár) - Telepítési útmutató
- **README.md** (gyökérkönyvtár) - Fejlesztői dokumentáció

---

## 📝 Dokumentáció frissítése

Ha frissíted a dokumentációt:

1. **Szerkeszd a USER_GUIDE.md-t**
   ```bash
   nano docs/USER_GUIDE.md
   ```

2. **Frissítsd a HTML verziót is** (ha szükséges)
   ```bash
   nano docs/USER_GUIDE.html
   ```

3. **Generálj új PDF-et**
   ```bash
   cd docs/
   ./generate-pdf.sh
   ```

4. **Commit és push**
   ```bash
   git add docs/
   git commit -m "docs: Update user guide"
   git push
   ```

---

## 🔧 Eszközök PDF generáláshoz

### wkhtmltopdf (ajánlott)

**Ubuntu/Debian:**
```bash
sudo apt-get install wkhtmltopdf
```

**MacOS:**
```bash
brew install wkhtmltopdf
```

**Windows:**
- Letöltés: https://wkhtmltopdf.org/downloads.html

### Chrome/Chromium headless

**Ubuntu/Debian:**
```bash
sudo apt-get install chromium-browser
```

**MacOS:**
```bash
brew install google-chrome
```

### Puppeteer (Node.js)

```bash
npm install puppeteer
```

---

## 📧 Támogatás

Ha kérdésed van a dokumentációval kapcsolatban:
- GitHub Issues: https://github.com/youruser/building-survey/issues
- Email: support@yourdomain.com

---

**Verzió:** 1.0
**Utolsó frissítés:** 2025. október 25.
