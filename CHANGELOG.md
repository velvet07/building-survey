# Changelog

A projekt összes fontos változását ebben a fájlban dokumentáljuk.

A formátum a [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) alapján készült,
és ez a projekt a [Semantic Versioning](https://semver.org/spec/v2.0.0.html) szabványt követi.

---

## [1.2.0] - 2025-10-24

### Rajzoló Modul - Tablet Optimalizáció és Teljesítmény Fejlesztések

Ez a verzió kritikus tablet támogatást és jelentős teljesítmény javításokat tartalmaz, különös tekintettel a gyors rajzolásra és kézírásra.

### Hozzáadva

#### Tablet Gesztus Támogatás
- **Két ujjas panning**: Két ujj mozgatása együtt pan-eli a canvas-t
  - Okos gesztus detektálás: >5% távolság változás = zoom, különben pan
  - Smooth folyamatos panning a két ujj középpontjának követésével
  - Automatikus ütközésdetektálás rajzolással (két ujj = mindig navigáció)

- **Pinch-to-zoom fejlesztések**: Javított két ujjas zoom
  - Zoom a két ujj középpontja körül
  - Jobb detektálás és érzékenység
  - Kombinálható pan mozgással (zoom közben lehet pan-elni is)

#### Default Értékek
- **Kék toll alapértelmezett**: Technikai/építészeti rajzokhoz optimalizált (#3B82F6)
- **4px vastagság**: Olvashatóbb vonalak alapértelmezetten (2px helyett)

### Javítva

#### Kritikus Tablet Bugok
- **Rajzolás nem mentődött tablet-en** (components/drawings/DrawingCanvas.tsx:773-783):
  - Probléma: `isDrawing.current = false` túl korán állítódott be touch event végén
  - Következmény: Stroke-ok nem commitálódtak, elvesztek a vonalak
  - Megoldás: `handleStageTouchEnd` már nem állítja false-ra az isDrawing flag-et
  - Eredmény: Minden touch-olt vonal helyesen mentődik

- **Auto-zoom bug tablet-en**:
  - Probléma: Papíron kívülre kattintva véletlenszerűen bezoomolt
  - Ok: Touch event és mouse event keveredése, rossz clientX/clientY kezelés
  - Megoldás: Új `getEventClientPosition()` helper funkció (129-142 sor)
  - Megfelelően kezeli TouchEvent (touches[0]) vs MouseEvent különbségét

- **Vonalak törlődtek gyors rajzolásnál**:
  - Probléma: Következő vonal törölte az előző vonalat, kézírás használhatatlan
  - Ok: Minden stroke completion blokkolta a UI-t history mentéssel
  - Megoldás: Gyors stroke-ok között is smooth működés

#### Teljesítmény Optimalizációk

**1. RequestAnimationFrame Throttling** (components/drawings/DrawingCanvas.tsx:324-340):
- Probléma: Folyamatos rajzolás közben 500-1000 render/sec → mikrofagyások
- Megoldás:
  - `scheduleStrokeUpdate()` funkció requestAnimationFrame-mel
  - currentStrokeRef azonnal frissül (adat pontosság 100%)
  - setCurrentStroke ~60fps-el hívódik (vizuális optimális)
- Eredmény: Smooth rajzolás hosszú vonalaknál, nincs lag

**2. Deferred History Saves** (components/drawings/DrawingCanvas.tsx:357-400):
- Probléma: Toll fel-le mozgatás (kézírás) → mikrofagyások minden stroke után
- Ok: commitStroke() 2-3 state frissítés + 100+ stroke másolása
- Megoldás:
  - Stroke azonnal látható (1 state frissítés)
  - History mentés 300ms delay + startTransition
  - 10 gyors stroke = 1 history mentés (batching)
  - React prioritálja a rajzolást a history mentés helyett
- Eredmény: Kézírás és gyors szkecselés természetes és smooth

**3. Toolbar Dropdown Láthatóság** (components/drawings/DrawingCanvas.tsx:1044-1049):
- Probléma: Színválasztó és vastagság dropdown-ok nem látszódtak tablet-en
- Ok: overflow-x-auto scroll container levágta az absolute pozíciójú dropdown-okat
- Megoldás: Feltételes overflow-visible amikor dropdown nyitva van
- Eredmény: Dropdown-ok helyesen jelennek meg minden eszközön

### Technikai Fejlesztések

- **Touch/Mouse Event Unifikáció**: getEventClientPosition() helper (129-142 sor)
- **Smart Gesture Detection**: Pinch vs pan automatikus felismerés
- **React 18 useTransition**: Nem sürgős frissítések (history) elkülönítése
- **Animation Frame Management**: Proper cleanup, memory leak prevention
- **Deferred State Updates**: setTimeout + startTransition kombinációja
- **Functional setState**: Closure problémák elkerülése

### Teljesítmény Eredmények

**Előtte:**
- ❌ 500-1000 render/sec folyamatos rajzolásnál
- ❌ Mikrofagyások hosszú vonalaknál
- ❌ Jelentős lag vonalak között (kézírás)
- ❌ Tablet-en vonalak nem mentődtek
- ❌ Tablet-en véletlenszerű auto-zoom
- ❌ Kézírás használhatatlan

**Utána:**
- ✅ ~60 render/sec (optimális frame rate)
- ✅ Smooth folyamatos rajzolás
- ✅ Nincs lag vonalak között
- ✅ Tablet-en minden vonal mentődik
- ✅ Tablet navigáció predictable
- ✅ Kézírás természetes és gyors

### Érintett Fájlok

**components/drawings/DrawingCanvas.tsx**:
- Line 10: useTransition import
- Line 74: useTransition hook használat
- Line 75-76: Default kék szín és 4px vastagság
- Line 112-116: Performance tracking refs
- Line 129-142: getEventClientPosition helper
- Line 294-307: Cleanup effects (animation frame + timeout)
- Line 324-340: scheduleStrokeUpdate requestAnimationFrame throttling
- Line 357-400: Optimalizált commitStroke deferred history-val
- Line 650-651: Throttled update használat
- Line 677-708: Javított handleStageTouchStart
- Line 710-771: Smart két ujjas gesture detection
- Line 773-783: Javított handleStageTouchEnd
- Line 1044-1049: Conditional toolbar overflow

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
