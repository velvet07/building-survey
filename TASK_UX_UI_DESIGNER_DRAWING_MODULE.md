# UX/UI Designer - Drawing Module Feladatok

**Projekt:** Moduláris WebApp MVP - Drawing Module (Felmérés Rajzoló Modul)
**Fázis:** FÁZIS 0 - Design & Planning
**Agent:** UX-UI-Designer-Agent
**Időkeret:** 14.5 óra (2 nap)

---

## 🎯 Projekt Kontextus

**Tech Stack:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + react-konva + jsPDF
- Backend: Supabase (PostgreSQL + RLS)
- UI Framework: Tailwind CSS
- UI Nyelv: Magyar
- Target Device: **Tablet-first**, desktop és mobile support

**Drawing Module Scope (MVP v1.0):**
- Alapvető rajzolás (toll, szín, vastagság, radír)
- Pan & Zoom (touch + mouse)
- **Tablet-optimalizált UI** (fő használati kontextus: helyszíni felmérések)
- MM papír háttér
- Projekt név megjelenítése rajzlapon
- Több rajz CRUD művelet
- Egyedi rajz PDF export
- A4 méret, álló/fekvő váltás

**Target felhasználók:** Építészek, műszaki szakemberek, felmérők

---

## 📝 Feladatok (UX-01 - UX-07)

### FELADAT UX-01: Drawing Canvas UI Layout (3 óra)

**Részfeladatok:**

1. **Canvas teljes képernyős layout tervezése:**
   - Teljes viewport: 100vw x 100vh
   - Canvas area: központi terület, full width/height
   - Toolbar: overlay vagy sidebar (device-dependent)

2. **Eszköztár (Toolbar) pozíció és viselkedés:**
   - **Desktop (> 1024px):** Fix sidebar bal oldalon, 80px szélesség, always visible
   - **Tablet (768px - 1024px):** Floating toolbar (lebegő), autohide after 3 sec inactivity, bottom-center pozíció
   - **Mobile (< 768px):** Bottom toolbar (collapsed), expandable accordion

3. **Toolbar elemek (priority order):**
   - **Primary tools:**
     - Toll ikon (pen tool)
     - Radír ikon (eraser)
     - Pan mód toggle ikon
   - **Drawing controls:**
     - Szín picker (színes körök, 6 preset color)
     - Vastagság slider (1-10px)
   - **Zoom controls:**
     - Zoom + gomb
     - Zoom - gomb
     - "Fit to screen" gomb (reset)
   - **Actions:**
     - Mentés gomb (💾 ikon, disabled ha nincs változás)
     - Vissza gomb (← ikon, vissza a projekt drawings listára)

4. **Canvas area design:**
   - Teljes width/height
   - Háttér: light gray (#F3F4F6) vagy white
   - MM grid overlay (SVG pattern)
   - Projekt név: fixált pozíció alul, center-aligned, nem mozog pan/zoom-mal
   - Projekt név formátum: "Projekt neve" (12pt, gray text)

5. **Responsive breakpoints:**
   - **Desktop:** Sidebar + canvas, toolbar always visible
   - **Tablet:** Full canvas, floating toolbar (autohide)
   - **Mobile:** Full canvas, bottom toolbar (collapsed)

**Deliverable:**
- `/home/velvet/building-survey/wireframes/drawing-canvas-layout-desktop.png`
- `/home/velvet/building-survey/wireframes/drawing-canvas-layout-tablet.png`
- `/home/velvet/building-survey/wireframes/drawing-canvas-layout-mobile.png`

**Tailwind hints:**
```
Desktop sidebar: "fixed left-0 top-0 h-full w-20 bg-white shadow-lg z-10"
Floating toolbar: "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4"
Canvas: "w-full h-full overflow-hidden touch-none"
```

---

### FELADAT UX-02: Drawing List View Wireframe (2.5 óra)

**Részfeladatok:**

1. **Rajz lista megjelenítése projekt részletek oldalon:**
   - Navigáció: Projekt oldalon új tab: "Rajzok" (mellett "Részletek" tab)
   - URL: `/dashboard/projects/[id]/drawings`

2. **Layout döntés:**
   - **Desktop (> 1024px):** Grid view, 3 columns, cards
   - **Tablet (768px - 1024px):** Grid view, 2 columns, cards
   - **Mobile (< 768px):** List view, 1 column, vertical cards

3. **Drawing Card tartalom:**
   - **Thumbnail preview:** 200x280px, background: light gray vagy canvas preview (post-MVP)
   - **Rajz név:** 18pt, bold, editable (click to edit inline)
   - **Létrehozás dátuma:** 12pt, gray, pl. "2025.09.30"
   - **Papír méret badge:** "A4" vagy "A3", 10pt, uppercase, gray background pill
   - **Orientáció ikon:** 📄 (portrait) vagy 📃 (landscape)
   - **Action buttons:**
     - "Szerkesztés" button (primary, blue)
     - "PDF Export" button (secondary, gray)
     - "Törlés" button (danger, red/light red)

4. **"Új rajz" CTA button:**
   - Prominens pozíció: top right (desktop/tablet) vagy bottom floating (mobile)
   - Large touch target: 56x56px (tablet/mobile)
   - Desktop: 48px height button, "Új rajz létrehozása" text
   - Tablet/Mobile: Floating Action Button (FAB), + ikon

5. **Empty state:**
   - Ikon: empty canvas illustration (például üres téglalap outline)
   - Szöveg: "Nincs még rajzod. Kezdj el rajzolni!"
   - "Új rajz" button (center-aligned)

**Deliverable:**
- `/home/velvet/building-survey/wireframes/drawing-list-view-desktop.png`
- `/home/velvet/building-survey/wireframes/drawing-list-view-tablet.png`
- `/home/velvet/building-survey/wireframes/drawing-list-view-mobile.png`

**Tailwind hints:**
```
Grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
Card: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
FAB: "fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg"
```

---

### FELADAT UX-03: Drawing Toolbar Components Design (2 óra)

**Részfeladatok:**

1. **Szín választó (Color Picker):**
   - **Preset színek display:**
     - Fekete (#000000)
     - Piros (#FF0000)
     - Kék (#0000FF)
     - Zöld (#00FF00)
     - Sárga (#FFFF00)
     - Szürke (#808080)
   - **Layout:** 6 színes kör, horizontális vagy 2x3 grid
   - **Size:** 40x40px színes kör, 44x44px touch target
   - **Active state:** 2px border ring (blue)
   - **Hover state:** border gray

2. **Vastagság slider (Stroke Width):**
   - **Range:** 1-10px
   - **Visual preview:** kis kör változó mérettel (1px circle → 10px circle)
   - **Labels:** "Vékony" (1px) / "Vastag" (10px)
   - **Tailwind slider:** Custom styled range input

3. **Tool buttons:**
   - **Toll ikon:** ✏️ vagy pen SVG icon
   - **Radír ikon:** 🧹 vagy eraser SVG icon
   - **Pan ikon:** ✋ vagy hand SVG icon
   - **Zoom in:** + ikon
   - **Zoom out:** - ikon
   - **Fit screen:** ⛶ vagy fullscreen SVG icon
   - **Size:** 48x48px button, 24x24px icon
   - **Active state:** filled background (blue)
   - **Inactive state:** transparent, icon gray

4. **Tailwind classes specifikálása:**
   ```
   Color button: "w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-400"
   Active color: "border-blue-500 ring-2 ring-blue-300"
   Tool button: "p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200"
   Active tool: "bg-blue-100 text-blue-600"
   Slider: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
   ```

**Deliverable:**
- `/home/velvet/building-survey/docs/drawing-toolbar-components.md` (Tailwind classes-szel)

---

### FELADAT UX-04: Paper Size & Orientation Selector (1.5 óra)

**Részfeladatok:**

1. **Méret választó UI:**
   - **Toggle buttons:** [A4] [A3]
   - **Active state:** filled background (blue)
   - **Inactive state:** white background, gray border
   - **Desktop:** Inline toolbar (top section)
   - **Tablet/Mobile:** Settings panel (modal vagy expandable drawer)

2. **Orientáció választó:**
   - **Icon-based toggle:** [📄 Portrait] [📃 Landscape]
   - **Portrait:** Vertical rectangle icon
   - **Landscape:** Horizontal rectangle icon
   - **Active state:** Blue fill
   - **Inactive state:** Gray outline

3. **Elhelyezés:**
   - **Desktop:** Toolbar top section, vertical layout
   - **Tablet:** Floating toolbar vagy settings menu (gear icon)
   - **Mobile:** Settings modal (gear icon → modal)

4. **Visual feedback:**
   - Canvas frame változik méret váltáskor (animated transition 0.3s)
   - Toast notification: "Papír méret váltva: A4 Álló" (opcionális)

5. **Tailwind classes:**
   ```
   Toggle group: "inline-flex rounded-lg border border-gray-300 bg-white p-1"
   Toggle button: "px-4 py-2 rounded-md text-sm font-medium"
   Active: "bg-blue-100 text-blue-700"
   Inactive: "text-gray-700 hover:bg-gray-50"
   Icon toggle: "flex items-center gap-2"
   ```

**Deliverable:**
- `/home/velvet/building-survey/wireframes/paper-size-selector.png`
- `/home/velvet/building-survey/docs/paper-size-selector-component.md`

---

### FELADAT UX-05: PDF Export Modal Design (2 óra)

**Részfeladatok:**

1. **Export modal layout:**
   - **Title:** "PDF Exportálás" (20pt, bold)
   - **Drawing preview thumbnail:** Small (150x210px), center-aligned
   - **Rajz neve:** Editable input, pre-filled
   - **Papír méret selector:** Radio buttons vagy toggle (A4/A3)
   - **Orientáció selector:** Radio buttons (Álló/Fekvő)
   - **"Letöltés PDF" button:** Primary button (blue), full width, icon: 📥
   - **"Mégse" button:** Secondary button (gray), full width

2. **Loading state:**
   - **Spinner:** Animated spinner + "PDF generálása..." text
   - **Progress bar:** Opcionális (ha nagy fájl)
   - **Button disabled:** "Letöltés PDF" button disabled during generation

3. **Success state:**
   - **Checkmark ikon:** ✅
   - **"PDF sikeresen letöltve!" message:** Green text
   - **Auto-close after 2 sec:** Modal bezáródik

4. **Multiple export (post-MVP placeholder):**
   - **Checkbox list:** Rajzokból
   - **"Export kiválasztott rajzok" button:** Batch export
   - **Batch progress bar:** 3/5 rajz exportálva

5. **Tailwind modal structure:**
   ```
   Overlay: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
   Modal: "bg-white rounded-lg shadow-xl max-w-md w-full p-6"
   Title: "text-xl font-bold mb-4"
   Button: "w-full px-6 py-3 rounded-lg font-semibold"
   ```

**Deliverable:**
- `/home/velvet/building-survey/wireframes/pdf-export-modal.png`
- `/home/velvet/building-survey/docs/pdf-export-modal-component.md`

---

### FELADAT UX-06: MM Grid Background Design (1.5 óra)

**Részfeladatok:**

1. **1mm x 1mm rács specifikáció:**
   - **Grid size:** 11.8px (1mm @ 300 DPI)
   - **Line color:** Light gray (#E5E7EB)
   - **Line width:** 0.5px
   - **Subtle:** Nem tolakodó, háttérben marad

2. **Vastagabb vonal minden 10mm-enként:**
   - **10mm = 118px**
   - **Line color:** Medium gray (#D1D5DB)
   - **Line width:** 1px
   - **Visual hierarchy:** Segíti a méretbecslést

3. **Rács rendering módszer:**
   - **DÖNTÉS:** SVG pattern (performant, skálázható)
   - **Alternatíva:** Canvas drawing (flexibilis, de lassabb)
   - **SVG pattern example:**
     ```svg
     <defs>
       <pattern id="grid" width="11.8" height="11.8" patternUnits="userSpaceOnUse">
         <line x1="0" y1="0" x2="11.8" y2="0" stroke="#E5E7EB" stroke-width="0.5"/>
         <line x1="0" y1="0" x2="0" y2="11.8" stroke="#E5E7EB" stroke-width="0.5"/>
       </pattern>
       <pattern id="grid-bold" width="118" height="118" patternUnits="userSpaceOnUse">
         <line x1="0" y1="0" x2="118" y2="0" stroke="#D1D5DB" stroke-width="1"/>
         <line x1="0" y1="0" x2="0" y2="118" stroke="#D1D5DB" stroke-width="1"/>
       </pattern>
     </defs>
     <rect fill="url(#grid)" width="100%" height="100%"/>
     <rect fill="url(#grid-bold)" width="100%" height="100%"/>
     ```

4. **Zoom behavior:**
   - **Rács skálázódik proportionally:** Zoom in → grid nagyobb, zoom out → grid kisebb
   - **Mindig látható:** Nem tűnik el zoom-nál
   - **Zoom < 50%:** Csak vastagabb vonalak (10mm grid) látható (performance optimization)
   - **Zoom > 200%:** Mindkét vonal típus látható

5. **PDF export behavior:**
   - **Rács beágyazva a PDF-be:** SVG pattern → raster image
   - **Nyomtatáskor méretarányos:** 1mm = 1mm fizikai méret (A4-en)
   - **Black & white print friendly:** Grid nem túl sötét

**Deliverable:**
- `/home/velvet/building-survey/docs/mm-grid-design-spec.md`

---

### FELADAT UX-07: Responsive Breakpoints & Touch Gestures (2 óra)

**Részfeladatok:**

1. **Responsive breakpoints:**
   - **Mobile (< 768px):**
     - Vertical layout
     - Bottom toolbar (collapsed, expandable)
     - Canvas full viewport height
     - Single column drawing list
     - Touch-optimized button sizes (min 44x44px)
   - **Tablet (768px - 1024px):**
     - **Landscape optimalizált** (target device)
     - Floating toolbar (autohide)
     - Canvas teljes képernyő
     - 2 column drawing list
     - Large touch targets (56x56px)
   - **Desktop (> 1024px):**
     - Sidebar + canvas layout
     - Toolbar always visible
     - 3 column drawing list
     - Standard button sizes (48px height)

2. **Touch gestures dokumentálása:**
   - **1 ujj:**
     - **Draw mode:** Rajzolás (stroke létrehozása)
     - **Pan mode:** Eltolás (canvas mozgatása)
   - **2 ujj:**
     - **Drag (parallel):** Pan (minden módban override)
     - **Pinch (pinch-to-zoom):** Zoom in/out
   - **3 ujj (opcionális, post-MVP):**
     - **Tap:** Undo last stroke

3. **Gesture conflict elkerülés:**
   - **Mode toggle:** Draw mode ↔ Pan mode (explicit toggle button)
   - **Visual indicator:** Toolbar icon highlight (blue background = active mode)
   - **Tablet-en:** Hosszú press (long press) → mode switch (alternatíva)
   - **2 ujj gesture:** Mindig override-olja az 1 ujj gesture-t (priority)

4. **Prevent default gestures:**
   - **CSS:** `touch-action: none` on canvas (megakadályozza pull-to-refresh, double-tap zoom)
   - **JavaScript:** `preventDefault()` on touch events
   - **No scroll:** Canvas area nem scrollozható (fixed height)

5. **Gesture feedback:**
   - **Visual feedback:** Cursor change (crosshair draw mode, hand pan mode)
   - **Touch feedback:** Haptic feedback (opcionális, ha támogatja a device)

**Deliverable:**
- `/home/velvet/building-survey/docs/drawing-responsive-behavior.md`
- `/home/velvet/building-survey/docs/touch-gestures-spec.md`

---

## 🚨 Kritikus Követelmények

1. **Követd a projektfeladat.md-ben definiált role leírást** (UX-UI-Designer-Agent.md)
2. **Tablet-first design:** Prioritás a tablet (768px-1024px) optimalizálásnál
3. **Touch-friendly:** Min 44x44px touch targets, large buttons
4. **Magyar UI szövegek:** Minden label, placeholder, button text magyarul
5. **Tailwind CSS classes:** Minden komponens Tailwind-del specifikálva
6. **Responsive:** 3 breakpoint (mobile, tablet, desktop)
7. **Wireframe-ek:** PNG vagy Figma link, annotált (méret, spacing hints)

---

## ✅ Sikerkritériumok

- ✅ 3 drawing canvas layout wireframe (desktop, tablet, mobile)
- ✅ 3 drawing list view wireframe (desktop, tablet, mobile)
- ✅ Toolbar komponensek Tailwind classes-szel dokumentálva
- ✅ Paper size selector wireframe + dokumentáció
- ✅ PDF export modal wireframe + dokumentáció
- ✅ MM grid design specifikáció (SVG pattern example)
- ✅ Responsive behavior dokumentáció
- ✅ Touch gestures dokumentáció

---

## 📌 Megjegyzések

- **NINCS implementáció** - csak design és dokumentáció!
- Frontend Engineer fogja implementálni a komponenseket (FÁZIS 2)
- System Architect párhuzamosan dolgozik a database schema-n
- Várható befejezés: **14.5 óra (2 nap)**

---

**Kezd el a munkát és térj vissza a deliverable-ökkel!**