# Building Survey - Felhasználói Kézikönyv

**Verzió:** 1.0
**Utolsó frissítés:** 2025. október 25.
**Készítette:** Building Survey Development Team

---

## Tartalomjegyzék

1. [Bevezetés](#1-bevezetés)
2. [Első lépések](#2-első-lépések)
3. [Felhasználói szerepkörök](#3-felhasználói-szerepkörök)
4. [Projektek kezelése](#4-projektek-kezelése)
5. [Rajzok modul](#5-rajzok-modul)
6. [Űrlapok modul](#6-űrlapok-modul)
7. [Fotók modul](#7-fotók-modul)
8. [Felhasználók kezelése (Admin)](#8-felhasználók-kezelése-admin)
9. [Tablet használat és ujjmozdulatok](#9-tablet-használat-és-ujjmozdulatok)
10. [Gyakori kérdések](#10-gyakori-kérdések)
11. [Hibaelhárítás](#11-hibaelhárítás)

---

## 1. Bevezetés

### 1.1 Mi a Building Survey?

A Building Survey egy webalapú alkalmazás épületfelmérések készítéséhez és dokumentálásához. Az alkalmazás lehetővé teszi:

- **Projektek létrehozását és kezelését**
- **Helyszíni rajzok készítését** tablet vagy számítógép segítségével
- **Űrlapok kitöltését** (pl. Aquapol felmérés)
- **Fotók csatolását és rendszerezését**
- **Csapatmunka támogatását** különböző jogosultsági szintekkel

### 1.2 Rendszerkövetelmények

#### Böngészők:
- **Desktop:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Tablet/Mobil:** Chrome Mobile, Safari iOS 14+

#### Ajánlott eszközök helyszíni használatra:
- **Tablet:** iPad (2018 vagy újabb), Samsung Galaxy Tab, vagy hasonló
- **Képernyő méret:** Minimum 10 hüvelyk
- **Érintőképernyő támogatás:** Igen (toll/ceruza támogatással előnyös)

#### Internet kapcsolat:
- **Aktív internet szükséges** (az alkalmazás online működik)
- **Ajánlott sebesség:** Minimum 5 Mbps

---

## 2. Első lépések

### 2.1 Bejelentkezés

1. **Nyisd meg az alkalmazást** a böngésződben:
   ```
   https://survey.yourdomain.com
   ```

2. **Bejelentkezési képernyő:**
   - Email cím megadása
   - Jelszó megadása
   - "Bejelentkezés" gomb megnyomása

3. **Elfelejtett jelszó:**
   - Kattints a "Elfelejtetted a jelszavad?" linkre
   - Add meg az email címed
   - Ellenőrizd az email fiókod
   - Kattints az email-ben kapott linkre
   - Adj meg új jelszót

### 2.2 Első bejelentkezés után

A sikeres bejelentkezés után a **Dashboard** (Vezérlőpult) jelenik meg, ahol láthatod:

- **Aktív projektek száma:** Az éppen folyamatban lévő projektek
- **Lezárt projektek száma:** Befejezett munkák
- **Archivált projektek száma:** Régi, archivált projektek
- **Gyors műveletek:** Új projekt létrehozása gomb

### 2.3 Navigáció az alkalmazásban

#### Bal oldali menü (Sidebar):

- **🏠 Dashboard:** Kezdőlap, áttekintés
- **📁 Projektek:** Összes projekt listája
- **👥 Felhasználók:** Felhasználók kezelése *(csak admin látja)*
- **⚙️ Admin:** Adminisztrációs beállítások *(csak admin látja)*

#### Felső sáv:

- **Felhasználó név/avatar:** Jobb felső sarokban
- **Kijelentkezés:** Felhasználó menü → "Kijelentkezés"

---

## 3. Felhasználói szerepkörök

A Building Survey három szerepkört támogat különböző jogosultságokkal:

### 3.1 Admin (Adminisztrátor)

**Jogosultságok:**
- ✅ Minden projekt megtekintése (saját + mások projektjei is)
- ✅ Minden projekt szerkesztése és törlése
- ✅ Új projekt létrehozása
- ✅ Rajzok készítése és szerkesztése minden projektben
- ✅ Űrlapok kitöltése és szerkesztése
- ✅ Fotók feltöltése és törlése
- ✅ Felhasználók kezelése (létrehozás, szerkesztés, törlés, jogosultságok)
- ✅ RLS policy-k frissítése
- ✅ Teljes rendszer hozzáférés

**Tipikus felhasználó:**
- Cégvezető, projekt menedzser, rendszergazda

### 3.2 User (Felhasználó)

**Jogosultságok:**
- ✅ Saját projektek megtekintése
- ✅ Saját projektek szerkesztése és törlése
- ✅ Új projekt létrehozása
- ✅ Rajzok készítése saját projektekben
- ✅ Űrlapok kitöltése saját projektekben
- ✅ Fotók feltöltése saját projektekben
- ❌ Mások projektjeinek megtekintése
- ❌ Felhasználók kezelése

**Tipikus felhasználó:**
- Felmérő mérnök, helyszíni dolgozó

### 3.3 Viewer (Megtekintő)

**Jogosultságok:**
- ✅ MINDEN projekt megtekintése (read-only)
- ✅ MINDEN rajz megtekintése
- ✅ MINDEN űrlap megtekintése
- ✅ PDF exportálás (projektek, rajzok, űrlapok)
- ❌ Projekt létrehozása, szerkesztése, törlése
- ❌ Rajz készítése vagy módosítása
- ❌ Űrlap kitöltése vagy szerkesztése
- ❌ Fotó feltöltése vagy törlése

**Tipikus felhasználó:**
- Ügyfél, külső auditor, csak olvasási joggal rendelkező partner

---

## 4. Projektek kezelése

### 4.1 Projektek listája

A **"Projektek"** menüpontban láthatod az összes projektet (szerepkörtől függően).

**Lista nézet:**
- **Projekt név:** Felhasználó által megadott név
- **Azonosító:** Automatikusan generált (pl. `PROJ-20251025-001`)
- **Állapot:** Aktív / Lezárt / Archivált
- **Létrehozás dátuma:** Projekt létrehozásának időpontja
- **Műveletek:** Szerkesztés, Törlés gombok *(jogosultságtól függően)*

**Szűrés és keresés:**
- **Keresőmező:** Projekt név vagy azonosító alapján
- **Állapot szűrő:** Aktív / Lezárt / Archivált szűrés

### 4.2 Új projekt létrehozása

**Lépések:**

1. Kattints a **"+ Új projekt"** gombra *(jobb felső sarokban)*

2. **Projekt adatok megadása:**
   - **Projekt név:** Kötelező, minimum 3 karakter (pl. "Kossuth utca 15. felmérés")
   - **Állapot:** Aktív *(alapértelmezett)*

3. Kattints a **"Mentés"** gombra

4. **Eredmény:**
   - Automatikus azonosító generálása (pl. `PROJ-20251025-001`)
   - Átirányítás a projekt részletek oldalára

### 4.3 Projekt szerkesztése

**Lépések:**

1. Nyisd meg a projekt listát (**"Projektek"** menü)

2. Kattints a **"Szerkesztés"** gombra a projekt kártyán

3. **Módosítható adatok:**
   - Projekt név
   - Állapot (Aktív / Lezárt / Archivált)

4. Kattints a **"Mentés"** gombra

**Megjegyzés:** Az automatikusan generált azonosító NEM módosítható.

### 4.4 Projekt törlése

**Figyelem:** A törlés **soft delete** (lágy törlés), az adatok fizikailag megmaradnak az adatbázisban.

**Lépések:**

1. Nyisd meg a projekt listát

2. Kattints a **"Törlés"** gombra a projekt kártyán

3. **Megerősítő ablak:**
   - "Biztosan törölni szeretnéd ezt a projektet?"
   - Projekt név megjelenítése

4. Kattints a **"Törlés"** gombra a megerősítéshez

5. **Eredmény:**
   - Projekt eltávolítása a listából
   - Archivált projektekben továbbra is elérhető (admin számára)

### 4.5 Projekt részletek oldal

Amikor megnyitsz egy projektet, a következő modulokat látod:

**Projekt információk:**
- Projekt név és azonosító
- Állapot (módosítható legördülő menü)
- Létrehozás és módosítás dátuma

**Modulok (tabok):**
- **📊 Áttekintés:** Projekt összefoglaló
- **📐 Rajzok:** Helyszíni rajzok listája
- **📋 Űrlapok:** Kitölthető űrlapok (pl. Aquapol)
- **📷 Fotók:** Feltöltött képek galériája

---

## 5. Rajzok modul

### 5.1 Rajzok áttekintése

A Rajzok modul lehetővé teszi helyszíni vázlatok, alaprajzok, részletek digitális rögzítését.

**Funkciók:**
- Kézzel rajzolás tablet/egér használatával
- Többféle rajzeszköz (toll, radír, kijelölés)
- Rétegek (layers) kezelése
- Zoom és pan (nagyítás, görgetés)
- PDF alap betöltése és rajzolás rá
- Exportálás PNG/PDF formátumba

### 5.2 Új rajz létrehozása

**Lépések:**

1. Nyisd meg a projektet

2. Válaszd ki a **"Rajzok"** tabot

3. Kattints a **"+ Új rajz"** gombra

4. **Rajz létrehozása:**
   - Automatikus név generálása (pl. "Rajz 1")
   - Üres vászon megjelenítése
   - Rajzeszközök aktiválása

### 5.3 Rajzeszközök használata

#### 5.3.1 Eszköztár (Desktop)

**Baloldali eszköztár:**

1. **Pan eszköz (Kéz ikon):**
   - Vászon mozgatása (görgetés)
   - Gyorsbillentyű: `Space + egér húzás`

2. **Toll eszköz (Ceruza ikon):**
   - Rajzolás szabadkézzel
   - Beállítások: szín, vonalvastagság
   - Gyorsbillentyű: `P`

3. **Radír eszköz (Radír ikon):**
   - Rajzelemek törlése
   - Beállítás: radír mérete
   - Gyorsbillentyű: `E`

4. **Kijelölés eszköz (Kurzor ikon):**
   - Elemek kijelölése és mozgatása
   - Törlés: `Delete` billentyű
   - Gyorsbillentyű: `V`

**Felső eszköztár:**

- **Szín választó:** 8 előre definiált szín + egyéni szín
- **Vonalvastagság:** Vékony (2px) / Közepes (4px) / Vastag (8px)
- **Papír méret:** A4 / A3 / A2 / Egyéni
- **Undo/Redo:** Visszavonás és újra gombok
- **Tisztítás:** Teljes vászon törlése (megerősítéssel)
- **Mentés:** Kézi mentés (auto-save 2 másodpercenként)
- **Exportálás:** PNG vagy PDF letöltés

#### 5.3.2 Rajzolás lépései (Desktop)

**Egyszerű rajzolás:**

1. Válaszd ki a **Toll eszközt** (ceruza ikon)

2. Válassz **színt** a felső eszköztáron

3. Állítsd be a **vonalvastagságot**

4. **Rajzolj:**
   - Kattints és húzd az egeret a vásznon
   - Folyamatos vonalak készítése

5. **Mentés:**
   - Automatikus mentés 2 másodpercenként
   - Vagy kattints a "Mentés" gombra

**Rajz módosítása:**

1. Válaszd ki a **Kijelölés eszközt** (kurzor ikon)

2. **Kattints egy vonalra** a kijelöléshez
   - Kijelölt elem kék színnel jelenik meg

3. **Művelet:**
   - **Mozgatás:** Húzd az elemet új helyre
   - **Törlés:** Nyomd meg a `Delete` billentyűt

**Radírozás:**

1. Válaszd ki a **Radír eszközt**

2. Húzd a radírt a törölni kívánt elemeken

3. Az elemek automatikusan törlődnek

### 5.4 Rajz szerkesztése

**Rajz megnyitása:**

1. Projekt → Rajzok tab

2. Kattints a rajz kártyára

3. **Szerkesztő betöltődik:**
   - Teljes képernyős nézet
   - Összes eszköz elérhető

**Rajz átnevezése:**

- Kattints a rajz nevére (felső bal sarokban)
- Írd be az új nevet
- Enter vagy kattints máshová mentéshez

**Visszalépés:**

- Kattints a **"← Vissza a projekthez"** gombra
- Automatikus mentés kilépés előtt

### 5.5 Rajz exportálása

**PDF exportálás:**

1. Nyisd meg a rajzot szerkesztő módban

2. Kattints a **"PDF exportálás"** gombra *(jobb felső sarokban)*

3. **Automatikus letöltés:**
   - Fájlnév: `rajz-[projekt-azonosító]-[dátum].pdf`
   - A4 méret (vagy beállított papír méret szerint)

**PNG exportálás:**

1. Ugyanúgy mint a PDF

2. Kattints a **"PNG exportálás"** gombra

3. Képfájl letöltése

### 5.6 Rajz törlése

**Lépések:**

1. Projekt → Rajzok tab

2. Kattints a **"Törlés"** gombra a rajz kártyán

3. Megerősítő ablak:
   - "Biztosan törölni szeretnéd ezt a rajzot?"
   - Rajz név megjelenítése

4. Kattints a **"Törlés"** gombra

5. **Eredmény:**
   - Soft delete (adatok megmaradnak)
   - Listából eltávolítva

---

## 6. Űrlapok modul

### 6.1 Űrlapok áttekintése

Az Űrlapok modul strukturált adatok gyűjtését teszi lehetővé előre definiált űrlapok kitöltésével.

**Jelenleg elérhető űrlap:**
- **Aquapol űrlap:** Falmenti páramentesítő rendszer felmérési adatlapja

### 6.2 Aquapol űrlap kitöltése

**Az űrlap felépítése:**

Az Aquapol űrlap 7 szakaszból áll:

1. **Alapadatok**
2. **Épület adatok**
3. **Fal állapot**
4. **Pince állapot**
5. **Talajvíz vizsgálat**
6. **Műszaki adatok**
7. **Megjegyzések**

**Űrlap megnyitása:**

1. Nyisd meg a projektet

2. Válaszd ki az **"Űrlapok"** tabot

3. Kattints az **"Aquapol űrlap"** gombra

**Mezők kitöltése:**

**Szövegmezők:**
- Kattints a mezőbe
- Írd be az adatot
- Tab billentyűvel ugorj a következő mezőre

**Számok:**
- Csak numerikus értékek (0-9)
- Tizedesjel: `.` vagy `,`

**Választó mezők (Radio button):**
- Kattints az egyik opcióra
- Csak egy választható

**Legördülő menü (Select):**
- Kattints a mezőre
- Válassz az opcióból
- Enter vagy kattintással erősítsd meg

**Checkbox (Igen/Nem):**
- Kattints a négyzetre a bejelöléshez
- Újra kattintás = visszavonás

**Többsoros szöveg (Textarea):**
- Hosszabb megjegyzések írása
- Enter = új sor

**Mentés:**

- **Automatikus mentés:** 5 másodpercenként (csak ha változott valami)
- **Kézi mentés:** Kattints a **"💾 Mentés"** gombra
- **Utolsó mentés ideje:** Felső részen látható

**PDF exportálás:**

1. Töltsd ki az űrlapot (legalább részben)

2. Kattints a **"📄 PDF exportálás"** gombra

3. **Automatikus letöltés:**
   - Fájlnév: `aquapol-[projekt-azonosító]-[dátum].pdf`
   - Teljes kitöltött űrlap PDF formátumban

### 6.3 Viewer mód (csak megtekintés)

Ha **Viewer** szerepkörrel vagy bejelentkezve:

**Látható:**
- ✅ Összes kitöltött mező
- ✅ PDF exportálás gomb

**Nem látható/nem elérhető:**
- ❌ Mentés gomb
- ❌ Mezők szerkesztése (disabled állapot)
- 🔵 **"Megtekintő mód"** badge megjelenik

**Navigáció:**
- Görgetés az űrlapon
- PDF export használható

---

## 7. Fotók modul

### 7.1 Fotók áttekintése

A Fotók modul lehetővé teszi helyszíni képek feltöltését és rendszerezését.

**Funkciók:**
- Fotók feltöltése (drag & drop vagy fájl tallózás)
- Thumbnail előnézet
- Teljes méret megtekintése
- Letöltés
- Törlés
- Galéria nézet

### 7.2 Fotó feltöltése

**Módszer 1: Drag & Drop (húzd és ejtsd)**

1. Nyisd meg a projektet

2. Válaszd ki a **"Fotók"** tabot

3. **Húzd a képfájlt** az ablakra
   - Drag & drop zóna megjelenik
   - Ejtsd a fájlt a zónán

4. **Automatikus feltöltés és megjelenítés**

**Módszer 2: Fájl tallózó**

1. Fotók tab megnyitása

2. Kattints a **"📷 Fotó feltöltése"** gombra

3. Válassz ki egy vagy több képet a fájlrendszerből
   - Többes kijelölés: `Ctrl + kattintás` (Windows/Linux) vagy `Cmd + kattintás` (Mac)

4. Kattints a **"Megnyitás"** gombra

5. **Automatikus feltöltés**

**Támogatott formátumok:**
- JPG/JPEG
- PNG
- WebP
- HEIC/HEIF (iOS)

**Maximális fájlméret:** 10 MB/kép

**Feltöltési folyamat:**
1. Fájl kiválasztása
2. Upload progress bar (folyamatjelző)
3. Thumbnail generálás
4. Megjelenítés a galériában

### 7.3 Fotó megtekintése

**Thumbnail nézet:**

- Projekt → Fotók tab
- Grid (rács) elrendezés
- 4 oszlop (desktop), 2 oszlop (tablet), 1 oszlop (mobil)
- Fotó neve alul látható

**Teljes méret megtekintése:**

1. Kattints egy fotó thumbnail-re

2. **Modal ablak nyílik meg:**
   - Teljes méretű kép
   - Fotó neve felül
   - Feltöltés dátuma
   - Fájl mérete

3. **Műveletek:**
   - **Letöltés:** Kattints a "⬇️ Letöltés" gombra
   - **Törlés:** Kattints a "🗑️ Törlés" gombra
   - **Bezárás:** `ESC` billentyű vagy `X` gomb

### 7.4 Fotó törlése

**Lépések:**

1. Nyisd meg a fotót (teljes méret)

2. Kattints a **"🗑️ Törlés"** gombra

3. **Megerősítő ablak:**
   - "Biztosan törölni szeretnéd ezt a fotót?"
   - Fotó neve megjelenítése

4. Kattints a **"Törlés"** gombra

5. **Eredmény:**
   - Fotó törlése az adatbázisból és tárhelyről
   - Eltávolítás a galériából

### 7.5 Viewer mód (Fotók)

**Viewer jogosultsággal:**

**Látható:**
- ✅ Összes feltöltött fotó
- ✅ Teljes méret megtekintés
- ✅ Letöltés gomb

**Nem látható:**
- ❌ Fotó feltöltése gomb
- ❌ Törlés gomb
- 🔵 **"Megtekintő mód - Fotó feltöltése nem elérhető"** banner megjelenik

---

## 8. Felhasználók kezelése (Admin)

**Csak Admin szerepkörrel elérhető!**

### 8.1 Felhasználók listája

**Navigáció:**
- Bal oldali menü → **"👥 Felhasználók"**

**Lista nézet:**
- **Felhasználó név/avatar:** Profil kép + teljes név
- **Email cím:** Bejelentkezési email
- **Szerepkör:** Admin / User / Viewer badge (színkóddal)
- **Létrehozás dátuma:** Regisztráció időpontja
- **Műveletek:** Szerkesztés, Törlés gombok

**Keresés:**
- Email cím vagy név alapján
- Valós idejű szűrés

### 8.2 Új felhasználó létrehozása

**Lépések:**

1. Kattints a **"+ Új felhasználó"** gombra

2. **Űrlap kitöltése:**

   - **Email cím:** Kötelező, érvényes email formátum
   - **Jelszó:** Kötelező, minimum 8 karakter
   - **Teljes név:** Opcionális
   - **Szerepkör:** Admin / User / Viewer (legördülő menü)

3. Kattints a **"Mentés"** gombra

4. **Eredmény:**
   - Felhasználó létrejön Supabase Auth-ban
   - Profile rekord létrehozása az adatbázisban
   - Automatikus email küldés (opcionális, ha be van állítva)

### 8.3 Felhasználó szerkesztése

**Lépések:**

1. Kattints a **"Szerkesztés"** gombra a felhasználó kártyán

2. **Módosítható adatok:**
   - Email cím
   - Teljes név
   - Szerepkör (Admin / User / Viewer)
   - Új jelszó (opcionális)

3. Kattints a **"Mentés"** gombra

**Megjegyzés:**
- Email cím módosítása esetén újra kell igazolni az új email-t
- Jelszó mezőt csak akkor töltsd ki, ha új jelszót szeretnél beállítani

### 8.4 Felhasználó törlése

**Lépések:**

1. Kattints a **"Törlés"** gombra

2. **Megerősítő ablak:**
   - "Biztosan törölni szeretnéd ezt a felhasználót?"
   - Felhasználó email címe megjelenítése

3. Kattints a **"Törlés"** gombra

4. **Eredmény:**
   - Soft delete (deleted_at timestamp beállítása)
   - Felhasználó nem tud többé bejelentkezni
   - Adatok megmaradnak az adatbázisban (auditálás céljából)

### 8.5 Visszaállítás (Restore)

Ha egy felhasználót töröltél, később visszaállíthatod:

**Lépések:**

1. Felhasználók lista → Szűrő: "Törölt felhasználók"

2. Kattints a **"Visszaállítás"** gombra

3. **Eredmény:**
   - deleted_at timestamp törlése
   - Felhasználó újra bejelentkezhet

---

## 9. Tablet használat és ujjmozdulatok

### 9.1 Általános tablet használat

**Optimalizált nézetek:**
- Tablet nézet automatikusan aktiválódik 768px - 1024px szélesség között
- Nagyobb gombok, könnyebb kezelhetőség
- Érintésre optimalizált UI elemek

**Tippek:**
- Használj álló (portrait) vagy fekvő (landscape) tájolást szabadon
- Teljes képernyős mód: Böngésző menü → "Hozzáadás kezdőképernyőhöz"

### 9.2 Rajzolás tableten

#### Alapvető ujjmozdulatok:

**Egy ujj (Rajzolás mód):**

1. **Rajzolás:**
   - Nyomd meg és húzd az ujjad a képernyőn
   - Folyamatos vonal készül

2. **Tap (érintés):**
   - Egy gyors érintés
   - Eszköz kiválasztása (gombok)
   - Pont elhelyezése

**Két ujj (Navigáció):**

1. **Pinch to Zoom (csíptetés zoomoláshoz):**
   - Helyezd két ujjad a képernyőre
   - Tágítsd szét = nagyítás
   - Szorítsd össze = kicsinyítés

2. **Pan (görgetés):**
   - Két ujjal húzd a vásznat
   - Vagy használd a "Pan eszköz"-t és egy ujjal

3. **Rotate (forgatás) - JÖVŐBELI:**
   - Két ujjal forgasd el a vásznat (még nincs implementálva)

**Három ujj (Speciális):**

- **Swipe left/right:** Undo/Redo (opcionális, ha támogatott)
- **Swipe down:** Bezárás/Vissza

#### Rajzolási módok tableten:

**Ujj rajzolás:**

1. Válaszd ki a **Toll eszközt**

2. Rajzolj az ujjaiddal
   - Pontosság: közepes
   - Gyors vázlatok készítéséhez

**Stylus/Ceruza használat (Apple Pencil, S Pen, stb.):**

1. Válaszd ki a **Toll eszközt**

2. Rajzolj a ceruza használatával
   - Pontosság: nagyon jó
   - Nyomásérzékenység: támogatott (ha az eszköz támogatja)
   - Palm rejection: automatikus (tenyér figyelmen kívül hagyása)

**Tippek a pontosabb rajzoláshoz:**

- **Nagyítsd a területet** (pinch zoom) mielőtt részletet rajzolsz
- **Használj vékonyabb vonalat** finom részletekhez
- **Kijelölés eszközzel** mozgasd az elemeket utólag
- **Undo gomb** közel az ujjhoz (jobb alsó sarok)

### 9.3 Tablet-specifikus gesztusok modulonként

#### Dashboard:

- **Swipe left/right a projekt kártyákon:** Gyors szerkesztés/törlés menü megjelenítése
- **Long press (hosszú érintés):** Kontextus menü

#### Projektek lista:

- **Swipe up/down:** Scroll (görgetés)
- **Pull to refresh (lehúzás frissítéshez):** Lista frissítése (jövőbeli)

#### Fotók galéria:

- **Pinch zoom:** Fotó nagyítása/kicsinyítése
- **Swipe left/right:** Következő/előző fotó (modal nézetben)
- **Double tap:** Zoom be/out (dupla érintés)

### 9.4 Teljesítmény optimalizálás tableten

**Ajánlott beállítások:**

- **Böngésző:** Chrome vagy Safari
- **JavaScript engedélyezve:** Igen
- **Hardveres gyorsítás:** Engedélyezve (böngésző beállítások)
- **Háttér alkalmazások:** Minimalizáld őket a jobb teljesítményért

**Lassú rajzolás esetén:**

1. **Csökkentsd a stroke vastagságát** (vékonyabb vonal = gyorsabb)
2. **Törölj nem használt rétegeket**
3. **Exportáld és indítsd újra a rajzot** (memória felszabadítás)

---

## 10. Gyakori kérdések

### 10.1 Bejelentkezés és fiók

**K: Elfelejtettem a jelszavam, mit tegyek?**

V: Kattints a bejelentkezési oldalon az "Elfelejtetted a jelszavad?" linkre. Add meg az email címed, és küldünk egy linket jelszó visszaállításhoz.

---

**K: Meg tudom változtatni az email címem?**

V: Igen, de csak Admin tudja módosítani. Kérj egy Admin felhasználót, hogy frissítse az email címed a Felhasználók kezelése menüpontban.

---

**K: Miért látok "Megtekintő mód" üzenetet?**

V: Ez azt jelenti, hogy Viewer szerepkörrel vagy bejelentkezve, amely csak olvasási jogot biztosít. Nem tudsz szerkeszteni, létrehozni vagy törölni. Kérj egy Admin felhasználót, hogy módosítsa a szerepköröd User vagy Admin-ra.

---

### 10.2 Projektek

**K: Látom mások projektjeit?**

V: Attól függ a szerepköröd:
- **Admin:** Látja mindenki projektjét
- **User:** Csak a saját projektjeit
- **Viewer:** Látja mindenki projektjét (read-only)

---

**K: Meg tudom változtatni az automatikus projekt azonosítót?**

V: Nem, az automatikus azonosító (pl. `PROJ-20251025-001`) nem módosítható. Ez garantálja az egyediséget.

---

**K: Mi a különbség az Aktív, Lezárt és Archivált állapotok között?**

V:
- **Aktív:** Folyamatban lévő projekt
- **Lezárt:** Befejezett projekt
- **Archivált:** Régi, lezárt projekt (hosszú távú tárolás)

---

### 10.3 Rajzok

**K: Tudok PDF-et betölteni alapnak és rajzolni rá?**

V: Jelenleg ez a funkció nincs implementálva, de a jövőbeli verzióban tervezzük.

---

**K: Mennyire lehet nagyítani a rajzvásznat?**

V: Zoom szint: 10% - 500% között. Pinch zoom vagy scroll wheel használatával.

---

**K: El lehet menteni a rajzot automatikusan?**

V: Igen, automatikus mentés történik 2 másodpercenként, ha van változtatás. Manuálisan is menthetsz a "Mentés" gombbal.

---

**K: Hogy tudom visszavonni az utolsó lépést (Undo)?**

V: Kattints az **"Undo"** gombra (balra mutató nyíl) a felső eszköztáron, vagy használd a `Ctrl+Z` (Windows/Linux) / `Cmd+Z` (Mac) billentyűkombinációt.

---

**K: Hány lépést lehet visszavonni?**

V: Az utolsó 50 lépést lehet visszavonni.

---

### 10.4 Fotók

**K: Milyen fotó formátumokat támogat az alkalmazás?**

V: JPG, JPEG, PNG, WebP, HEIC/HEIF (iOS kamerából).

---

**K: Mi a maximális fotó méret?**

V: 10 MB/fotó. Nagyobb fájlokat az alkalmazás elutasít.

---

**K: Tudok egyszerre több fotót feltölteni?**

V: Igen, használd a fájlböngészőt és jelölj ki több fájlt `Ctrl` (vagy `Cmd`) + kattintással. Vagy húzz be több fájlt drag & drop-pal.

---

### 10.5 Teljesítmény

**K: Lassú a rajzolás tableten, mit tegyek?**

V:
1. Használj vékonyabb vonalat
2. Csökkentsd a zoom szintet
3. Töröld a nem használt elemeket
4. Zárd be a háttér alkalmazásokat
5. Próbáld újra betölteni az oldalt

---

**K: Az alkalmazás offline is működik?**

V: Nem, az alkalmazás online működik. Aktív internet kapcsolat szükséges.

---

## 11. Hibaelhárítás

### 11.1 Bejelentkezési problémák

**Probléma:** "Érvénytelen email vagy jelszó" hibaüzenet

**Megoldás:**
1. Ellenőrizd az email cím helyességét (kis/nagybetű nem számít)
2. Ellenőrizd a jelszót (kis/nagybetű SZÁMÍT!)
3. Próbáld meg a jelszó visszaállítást
4. Ha továbbra sem működik, kérj segítséget az Admin-tól

---

**Probléma:** "Túl sok bejelentkezési kísérlet" hibaüzenet

**Megoldás:**
- Várj 15 percet, majd próbáld újra
- Ha sürgős, kérj jelszó visszaállítást

---

### 11.2 Rajzolási problémák

**Probléma:** Nem tudok rajzolni, az ujjam csak görget

**Megoldás:**
1. Ellenőrizd, hogy a **Toll eszköz** van-e kiválasztva (nem a Pan eszköz)
2. Ha két ujjal próbálsz rajzolni, az zoom/pan lesz - használj egy ujjat
3. Próbáld meg újratölteni az oldalt: `F5` vagy `Ctrl+R`

---

**Probléma:** A rajzom eltűnt / nem jelenik meg

**Megoldás:**
1. Ellenőrizd a zoom szintet (lehet túl kicsire van nagyítva)
2. Használd a Pan eszközt és nézz körbe
3. Ellenőrizd a böngésző konzolt (F12) hibaüzenetekért
4. Ha továbbra sem látod, frissítsd az oldalt

---

**Probléma:** Nem tudom kijelölni az elemet

**Megoldás:**
1. Használd a **Kijelölés eszközt** (kurzor ikon)
2. Kattints pontosan a vonalra (nem mellé)
3. Ha túl kicsi az elem, nagyíts rá előbb

---

### 11.3 Feltöltési problémák

**Probléma:** "Fájl méret túl nagy" hibaüzenet

**Megoldás:**
1. Tömörítsd a képet (pl. online eszköz: TinyPNG, CompressJPEG)
2. Csökkentsd a felbontást (pl. 1920x1080 helyett 1280x720)
3. Konvertáld JPG-re PNG helyett

---

**Probléma:** Fotó feltöltés megszakad / nem töltődik fel

**Megoldás:**
1. Ellenőrizd az internet kapcsolatot
2. Próbáld meg kisebb fájllal
3. Frissítsd az oldalt és próbáld újra
4. Ha továbbra sem működik, ellenőrizd a szerver logokat (Admin)

---

### 11.4 Böngésző-specifikus problémák

**Safari (iOS):**

**Probléma:** Ujj rajzolás nem működik pontosan

**Megoldás:**
- Engedélyezd a "Tenyér elutasítás" opciót (Settings → Apple Pencil)
- Használj Apple Pencil-t pontosabb rajzoláshoz

---

**Chrome (Android):**

**Probléma:** Lassú a rajzolás

**Megoldás:**
1. Engedélyezd a hardveres gyorsítást:
   - Chrome → Beállítások → Rendszer → Hardveres gyorsítás használata
2. Töröld a böngésző cache-t
3. Frissítsd a Chrome-ot a legújabb verzióra

---

### 11.5 Egyéb problémák

**Probléma:** "Session lejárt" üzenet

**Megoldás:**
- Jelentkezz be újra
- Túl hosszú inaktivitás után automatikus kijelentkezés történik (biztonsági okok)

---

**Probléma:** UI elemek nem jelennek meg helyesen

**Megoldás:**
1. Töröld a böngésző cache-t: `Ctrl+Shift+Delete` (Chrome)
2. Frissítsd az oldalt hard reload-dal: `Ctrl+Shift+R`
3. Próbáld meg inkognito/privát módban

---

**Probléma:** "Nincs jogosultság" hibaüzenet

**Megoldás:**
- Ellenőrizd a szerepköröd (Dashboard → Profil)
- Kérj Admin felhasználót, hogy módosítsa a jogosultságodat
- Ha User vagy, csak saját projektjeidet szerkesztheted

---

## Támogatás és Kapcsolat

Ha nem találsz választ a kérdésedre ebben a dokumentációban:

**Admin felhasználók:**
- Ellenőrizd a szerveroldali logokat
- Nézd meg az `INSTALL.md` és `README.md` fájlokat

**Felhasználók:**
- Kérdezd meg az Admin felhasználót vagy csapat vezetőt
- Jelentsd a problémát GitHub Issues-ban (ha elérhető)

---

**Dokumentáció verzió:** 1.0
**Utolsó frissítés:** 2025. október 25.
**Készítette:** Building Survey Development Team

**© 2025 Building Survey. Minden jog fenntartva.**
