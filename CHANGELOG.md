# Changelog

A projekt összes fontos változását ebben a fájlban dokumentáljuk.

A formátum a [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) alapján készült,
és ez a projekt a [Semantic Versioning](https://semver.org/spec/v2.0.0.html) szabványt követi.

---

## [1.1.0] - 2025-10-23

### Rajzoló Modul - Fő Funkciók és Javítások

Ez a verzió jelentős fejlesztéseket tartalmaz a rajzoló modul használhatóságában és funkcionalitásában, különös tekintettel a tablet és desktop használatra.

### Hozzáadva

#### Kijelölés és Szerkesztés
- **Lasso Selection Tool (➰)**: Új szabadkézi kijelölő eszköz területi kijelöléshez
  - Szabadkézi kijelölés rajzolással a canvas-on
  - Point-in-polygon algoritmus (ray casting) a kijelölt elemek meghatározásához
  - Kijelölt elemek mozgatása drag-and-drop módszerrel
  - Bárhol a kijelölt területen belül lehet húzni az elemeket
  - Dupla rétegű vizuális kiemelés (kék ragyogás +16px és +8px overlay-vel)
  - Kijelölt elemek törlése DELETE billentyűvel
  - Kijelölés megszüntetése ESC billentyűvel
  - Vizuális visszajelzés: szaggatott kék vonal a kijelölési terület körül

#### Canvas Navigáció
- **Fejlett panning (mozgatás) lehetőségek**:
  - Rajzlapon kívülre kattintva és húzva a canvas mozgatása
  - Középső egérgomb lenyomásával panning bárhol
  - Pan tool (🖐️) dedikált eszköz a canvas mozgatásához
  - Smooth panning élmény ref-alapú pozíció tárolással

- **Desktop zoom fejlesztések**:
  - Ctrl + görgő: zoom in/out funkció
  - Zoom a kurzor pozíciója körül (nem a canvas közepére)
  - Zoom tartomány: 25% - 400%
  - Zoom step: 10%

#### PDF Export Integráció
- PDF export gomb hozzáadva a főmenühöz
- Meglévő PDFExportModal komponens integrálása
- Export a beállított papírmérettel és orientációval (A4/A3, álló/fekvő)
- Automatikus fájlnév generálás: `{rajz_név}_{dátum}.pdf`

#### Visszavonás (Undo) Rendszer
- **Teljes körű undo funkció** az összes műveletre:
  - Rajzolás visszavonása (pen tool)
  - Radírozás visszavonása
  - Kijelölt elemek mozgatásának visszavonása
  - Kijelölt elemek törlésének visszavonása
  - Teljes canvas törlés visszavonása
- History stack implementáció állapot pillanatképekkel
- Okos történelem mentés: csak a művelet kezdetén történik mentés, nem minden mozgásnál
- Ref-alapú flag a duplikált történelem bejegyzések elkerülésére

### Javítva

#### Toolbar és UI Javítások
- **Reszponzív toolbar design**:
  - Dinamikus szélesség: teljes szélesség desktop-on, testreszabott mobilon
  - Túlcsordulás kezelés: csak max-xl breakpoint alatt jelenik meg scrollbar
  - Kompakt színválasztó: dropdown helyett inline 8 szín grid
  - Javított elrendezés kisebb eszközökön
  - Thin scrollbar stílus amikor szükséges

- **Mentés állapot jelző**:
  - Kilógó "Automatikus mentés kész" szöveg eltávolítva
  - Csak színes indikátor pont maradt (piros/zöld)
  - Tooltip súgó hozzáadva az ikonhoz

#### Kritikus Hibák
- **Panning rajzolási hiba javítása** (components/drawings/DrawingCanvas.tsx:439-457):
  - Probléma: Rajzlapon kívül kattintva és húzva vonalat húzott a rajzlap széléig
  - Ok: `getCanvasPoint` lefoglalta a pontokat a canvas szélére mielőtt ellenőrizte volna, hogy a pont bent van-e
  - Megoldás: Nyers pont ellenőrzése először, csak valódi rajzoláshoz történik clamping
  ```typescript
  // Get raw canvas point without clamping first
  const rawCanvasPoint = inverted.point(pointer);
  const isInsideCanvas = isPointInsideCanvas(rawCanvasPoint, canvasWidth, canvasHeight);

  // Pan tool OR click outside canvas - enable panning
  if (tool === 'pan' || !isInsideCanvas) {
    isPanning.current = true;
    // Don't clamp - allow panning
    return;
  }

  // Now clamp for actual drawing
  const canvasPos = clampPointToCanvas(rawCanvasPoint, canvasWidth, canvasHeight);
  ```

- **Kijelölés láthatósági javítás**:
  - Korábbi egyszerű kék outline alig volt látható
  - Új: dupla rétegű glow effekt nagyobb opacitással
  - Külső réteg: +16px, 25% opacity
  - Belső réteg: +8px, 50% opacity
  - Jobb vizuális kontrast minden háttéren

#### Típusdefiníciók
- `DrawingTool` típus kibővítése `'select'` és `'pan'` értékekkel (lib/drawings/types.ts:13)

### Változtatva

- **Kijelölés eszköz ikon**: 👆 (click) → ➰ (curly loop) jobb szimbolizálásért
- **Toolbar szélesség**: fix méretről dinamikusra (`w-auto max-w-[98vw]`)
- **Színválasztó UI**: nagy dropdown helyett kompakt inline grid
- **Mentés visszajelzés**: szöveg helyett csak ikon + tooltip

### Technikai Fejlesztések

- Point-in-polygon ray casting algoritmus implementálása
- History state management pattern állapot pillanatképekkel
- Ref-alapú gesture tracking a jobb teljesítményért
- Javított koordináta transzformáció panning-hez
- Okosabb event handling drawing vs. navigation szétválasztáshoz

### Teljesítmény

- Optimalizált stroke rendering kijelölt állapottal
- Hatékony történelem tárolás (csak szükséges műveleteknél)
- Smooth canvas transzformációk ref-használattal
- Csökkentett újra-renderelések selection drag közben

---

## [1.0.0] - 2025-09-30

### Hozzáadva

#### Rajzoló Modul - MVP Core
- **Drawing Canvas** teljes implementációja React-Konva-val
  - Szabadkézi rajzolás (pen tool)
  - Radír funkció (eraser tool)
  - Mouse és touch support
  - Real-time stroke rendering
  - MM grid háttér (11.8px = 1mm @ 300 DPI)

- **Backend Infrastructure**:
  - `drawings` tábla JSONB canvas_data tárolással
  - Enum típusok: `paper_size_enum`, `paper_orientation_enum`
  - 5 optimalizált index
  - RLS policies (SELECT, INSERT, UPDATE)
  - Auto-naming function és trigger
  - 8 utility function (CRUD, stats, pagination)

- **Frontend Komponensek**:
  - `DrawingCanvas.tsx` - fő rajzoló komponens
  - Drawing list view (grid layout)
  - Drawing editor wrapper
  - API functions (lib/drawings/api.ts)
  - Canvas utilities (lib/drawings/canvas-utils.ts)
  - TypeScript típusdefiníciók

- **Canvas Funkciók**:
  - Zoom in/out/fit gombok
  - Programmatic zoom (25%-400%)
  - Fit to screen funkció
  - Canvas automatikus centrálása
  - Projekt név megjelenítés (jobb alsó sarok)

- **Papír Támogatás**:
  - A4 és A3 méret támogatás (backend)
  - Portrait és Landscape orientáció (backend)
  - 300 DPI felbontás

#### Alap Rendszer
- Next.js 14 App Router
- Supabase authentication (email/password)
- Role-based access control (Admin, User, Viewer)
- Project management CRUD
- Protected routes middleware
- Magyar nyelvi támogatás

### Dokumentáció
- 28 dokumentum létrehozva
- Backend implementation guide
- Frontend setup guide
- Security audit
- QA testing guide (55 test case)
- Deployment guide (Netlify)

---

## Upcoming Features (Tervezett)

A következő verziókban várható funkciók:

### Rajzoló Modul Kiegészítések
- [ ] Alakzat eszközök (vonal, kör, téglalap)
- [ ] Szöveg hozzáadása
- [ ] Rétegek (layers)
- [ ] Méretek és címkézés
- [ ] Több oldal támogatás
- [ ] Képimport funkció
- [ ] Automatikus mentés (30 sec interval)
- [ ] Rajz másolás és duplikálás
- [ ] Sablon rendszer

### UX Fejlesztések
- [ ] Tablet floating toolbar
- [ ] Mobile bottom toolbar
- [ ] Hamburger menu collapse
- [ ] Drawing name inline edit
- [ ] Thumbnail preview a listában
- [ ] Drag-and-drop file upload
- [ ] Képernyő orientáció lock tablet-en

### Együttműködés
- [ ] Real-time collaborative editing
- [ ] Verziókezelés
- [ ] Kommentek és jegyzetek
- [ ] Export Google Drive-ra
- [ ] Megosztás külsősökkel

---

**Karbantartja:** Building Survey Development Team

**Generated with:** Claude Code (https://claude.com/claude-code)
