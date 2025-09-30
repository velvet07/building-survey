# 📋 Felmérés Rajzoló Modul - Projekt Terv

**Készítette:** Product Manager  
**Verzió:** 1.0  
**Dátum:** 2025-09-30  
**Projekt:** Moduláris WebApp MVP - Drawing Module

---

## 🎯 Modul Áttekintés

**Modul név:** Felmérés Rajzoló (Survey Drawing Module)

**Cél:** Építészeti/műszaki felmérési rajzok készítése és kezelése projekten belül, tablet-optimalizált környezetben.

**Target felhasználók:** Építészek, műszaki szakemberek, felmérők

**Használati kontextus:** Helyszíni felmérések során tableten rajzolás, később desktop-on szerkesztés/export

---

## 📊 User Stories & Acceptance Criteria

### Epic: Felmérés Rajzoló Modul

#### US-01: Mint felmérő, szabadkézi rajzot szeretnék készíteni, hogy dokumentáljam a helyszíni méréseket

**Acceptance Criteria:**
- [ ] Canvas rajzfelület elérhető a projekt részletei oldalon
- [ ] Ujj/stylus érintéssel lehet rajzolni (touch support)
- [ ] Egér támogatás desktop-on
- [ ] Rajz valós időben jelenik meg késleltetés nélkül
- [ ] Smooth vonalvezetés (nem pixeles/szaggatott)

---

#### US-02: Mint felhasználó, testre szeretném szabni a rajzeszközt, hogy különböző elemeket jelöljek

**Acceptance Criteria:**
- [ ] Toll szín kiválasztó (color picker vagy preset színek)
- [ ] Toll vastagság csúszka (pl. 1-10px)
- [ ] Előnézet a kiválasztott beállításokról
- [ ] Radír funkció (háttér színnel rajzolás)
- [ ] Beállítások perzisztensen mentődnek munkamenet alatt

---

#### US-03: Mint felhasználó, szeretnék navigálni a rajzfelületen, hogy nagy rajzoknál is kényelmesen dolgozhassak

**Acceptance Criteria:**
- [ ] Kétujjas gesture-rel pan (eltolás) tablet-en
- [ ] Pinch-to-zoom tablet-en (csíptetős zoom)
- [ ] Egér scroll/drag pan desktop-on
- [ ] Zoom gombok (+/-) alternatívaként
- [ ] "Fit to screen" reset gomb
- [ ] Zoom level: 25%-400%
- [ ] Pan/zoom közben ne rajzoljon

---

#### US-04: Mint felmérő, tabletre optimalizált felületet szeretnék, hogy helyszínen hatékonyan dolgozhassak

**Acceptance Criteria:**
- [ ] Touch-first design (nagy gombok, jól kattintható elemek)
- [ ] Teljes képernyős rajzolási mód tablet-en
- [ ] Landscape és portrait támogatás
- [ ] Eszköztár autohide tablet-en (ne zavarja a rajzolást)
- [ ] Responsive: 768px+ (tablet) és 1024px+ (desktop)
- [ ] Stylus pressure sensitivity (opcionális, ha támogatja a böngésző)

---

#### US-05: Mint felhasználó, szeretném menteni a rajzokat, hogy később is szerkeszthessem

**Acceptance Criteria:**
- [ ] "Mentés" gomb minden rajznál
- [ ] Auto-save 30 másodpercenként (opcionális, post-MVP)
- [ ] Rajz adat JSON vagy SVG formátumban tárolva DB-ben
- [ ] "Utolsó mentés" időpont megjelenítése
- [ ] Loading state mentés közben
- [ ] Success notification sikeres mentés után

---

#### US-06: Mint felhasználó, mm papír hátteret szeretnék, hogy pontos méréseket jelölhessek

**Acceptance Criteria:**
- [ ] 1mm x 1mm rács háttérként
- [ ] Rács látható de diszkrét (light gray, nem tolakodó)
- [ ] Rács skálázódik zoom-kor (méretarányosan)
- [ ] PDF export-ban is megjelenik a rács
- [ ] Nyomtatásban 1mm = 1mm fizikai méret (A4-en)

---

#### US-07: Mint felhasználó, azonosítani szeretném a rajzokat, hogy ne keveredjenek össze

**Acceptance Criteria:**
- [ ] Projekt neve megjelenik a rajzlap alján
- [ ] Projekt név fixált pozíció (nem mozog pan/zoom-mal)
- [ ] Olvasható betűméret (min. 12pt)
- [ ] PDF export-ban is megjelenik
- [ ] Rajz neve is megjelenik (opcionális)

---

#### US-08: Mint felhasználó, több rajzot szeretnék létrehozni egy projekten belül, hogy különböző nézeteket dokumentáljak

**Acceptance Criteria:**
- [ ] "Új rajz" gomb
- [ ] Alapértelmezett név: "Alaprajz" (incremental: "Alaprajz 2", "Alaprajz 3")
- [ ] Rajz lista megjelenítése (thumbnails vagy list view)
- [ ] Rajz név inline szerkeszthető (click to edit)
- [ ] Max 50 rajz/projekt (technikai limit)

---

#### US-09: Mint felhasználó, szeretném törölni a felesleges rajzokat, hogy rendezett maradjon a projekt

**Acceptance Criteria:**
- [ ] "Törlés" gomb minden rajznál
- [ ] Confirmation modal: "Biztosan törölni szeretnéd?"
- [ ] Soft delete (deleted_at oszlop)
- [ ] Success notification törlés után
- [ ] Törölt rajzok nem jelennek meg a listában

---

#### US-10: Mint felhasználó, PDF-be szeretném exportálni a rajzokat, hogy megoszthassam vagy nyomtathassam

**Acceptance Criteria:**
- [ ] "PDF Export" gomb
- [ ] Egyedi rajz exportálása: 1 PDF = 1 rajz
- [ ] Több rajz exportálása: checkbox select + "Export selected" (post-MVP)
- [ ] PDF tartalmazza: mm rács, rajz, projekt név
- [ ] PDF méret: A4 vagy A3 (user választása alapján)
- [ ] Álló/fekvő orientáció választható
- [ ] Filename: `{projekt_név}_{rajz_név}_{dátum}.pdf`

---

#### US-11: Mint felhasználó, papír méretet és orientációt szeretnék váltani, hogy különböző méretű felmérésekhez alkalmazkodjak

**Acceptance Criteria:**
- [ ] Méret választó: A4 / A3
- [ ] Orientáció választó: Álló (Portrait) / Fekvő (Landscape)
- [ ] Beállítások rajzonként mentődnek
- [ ] Canvas méret újraszámítódik váltáskor
- [ ] Létező rajz nem veszhet el méret váltásnál
- [ ] PDF export figyelembe veszi a beállított méretet

---

## 🏗️ MVP Scope Meghatározás

### ✅ MVP-BE KERÜL (v1.0):
- Alapvető rajzolás (toll, szín, vastagság, radír)
- Pan & Zoom (touch + mouse)
- Tablet optimalizált UI
- Rajz mentése és szerkesztése
- MM papír háttér
- Projekt név megjelenítése
- Több rajz kezelése (CRUD)
- Egyedi rajz PDF export
- A4 méret, álló/fekvő váltás

### 🔄 POST-MVP (v1.1):
- Több rajz együttes PDF export
- A3 méret támogatás
- Auto-save funkció
- Undo/Redo (visszavonás)
- Shape tools (egyenes vonal, kör, téglalap)
- Stylus pressure sensitivity
- Rajz duplicálás

### 🚫 NEM LESZ BENNE:
- Layer rendszer (túl komplex MVP-hez)
- Text tool (későbbi verzió)
- Import külső rajzok (későbbi verzió)
- Kollaboratív rajzolás (real-time sync)
- Rajz history/version control

---

## 🎨 Agent Feladatok Részletezése

### 1️⃣ System Architect - Database & Architecture

#### FELADAT SA-01: Database Schema - Drawings Table

**Részfeladatok:**
- [ ] `drawings` tábla tervezése:
  ```sql
  CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Alaprajz',
    canvas_data JSONB NOT NULL DEFAULT '{"version":"1.0","strokes":[],"metadata":{}}',
    paper_size paper_size_enum NOT NULL DEFAULT 'a4',
    orientation paper_orientation_enum NOT NULL DEFAULT 'portrait',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
  );
  
  CREATE TYPE paper_size_enum AS ENUM ('a4', 'a3');
  CREATE TYPE paper_orientation_enum AS ENUM ('portrait', 'landscape');
  ```
- [ ] Index-ek létrehozása:
  ```sql
  CREATE INDEX idx_drawings_project_id ON drawings(project_id);
  CREATE INDEX idx_drawings_deleted_at ON drawings(deleted_at);
  CREATE INDEX idx_drawings_created_by ON drawings(created_by);
  ```
- [ ] RLS Policies tervezése:
  - SELECT: User látja saját projekt rajzait, Admin mindent
  - INSERT: User/Admin hozhat létre rajzot
  - UPDATE: Csak owner és Admin szerkeszthet
  - DELETE: Csak owner és Admin törölhet (soft delete)

**Deliverable:**
- `supabase/schema_drawings.sql`
- `supabase/policies_drawings.sql`

**Időtartam:** 2 óra

---

#### FELADAT SA-02: Canvas Data Format Specifikáció

**Részfeladatok:**
- [ ] Rajz adat struktúra JSON formátumban:
  ```json
  {
    "version": "1.0",
    "strokes": [
      {
        "id": "uuid",
        "points": [[x1, y1], [x2, y2], ...],
        "color": "#000000",
        "width": 2,
        "timestamp": "ISO8601"
      }
    ],
    "metadata": {
      "canvas_width": 2480,
      "canvas_height": 3508,
      "grid_size": 10
    }
  }
  ```
- [ ] Stroke optimalizálás megfontolások (Bezier curve simplification)
- [ ] Max file size limit dokumentálása: 5MB/rajz

**Deliverable:**
- `docs/canvas-data-format.md`

**Időtartam:** 1.5 óra

---

#### FELADAT SA-03: Tech Stack Döntések - Canvas Library

**Részfeladatok:**
- [ ] Canvas rendering library kiválasztása és dokumentálása:
  - **Option A:** HTML5 Canvas API (natív, lightweight)
  - **Option B:** Fabric.js (feature-rich, de nagyobb bundle)
  - **Option C:** Konva.js (React-friendly, performant, jó touch support)
  - **DÖNTÉS:** Konva.js (react-konva) - előnyök:
    - React integráció
    - Jó performance
    - Built-in zoom/pan support
    - Touch/gesture support
    - TypeScript support
- [ ] PDF generation library:
  - **DÖNTÉS:** jsPDF - előnyök:
    - Client-side generálás
    - Könnyű használat
    - Canvas to image conversion
- [ ] Touch/gesture handling:
  - React Touch Events + custom hooks

**Deliverable:**
- `docs/drawing-module-tech-stack.md`

**Időtartam:** 2 óra

---

#### FELADAT SA-04: API Endpoint Struktúra

**Részfeladatok:**
- [ ] Drawing CRUD endpoints dokumentálása:
  ```
  GET    /api/projects/:project_id/drawings        - Lista lekérése
  POST   /api/projects/:project_id/drawings        - Új rajz létrehozása
  GET    /api/drawings/:id                         - Egyedi rajz lekérése
  PATCH  /api/drawings/:id                         - Rajz frissítése
  DELETE /api/drawings/:id                         - Rajz törlése (soft)
  POST   /api/drawings/:id/export-pdf              - PDF generálás
  ```
- [ ] Request/Response format példák:
  ```typescript
  // POST /api/projects/:project_id/drawings
  Request: { name?: string, paper_size?: 'a4'|'a3', orientation?: 'portrait'|'landscape' }
  Response: { id: uuid, name: string, ... }
  
  // PATCH /api/drawings/:id
  Request: { canvas_data?: jsonb, name?: string, paper_size?: 'a4'|'a3' }
  Response: { success: boolean, updated_at: timestamp }
  ```

**Deliverable:**
- `docs/drawing-api-spec.md`

**Időtartam:** 1.5 óra

---

### 2️⃣ UX/UI Designer - Interface & Wireframes

#### FELADAT UX-01: Drawing Canvas UI Layout

**Részfeladatok:**
- [ ] Canvas teljes képernyős layout tervezése
- [ ] Eszköztár (Toolbar) pozíció és viselkedés:
  - **Desktop:** Fix sidebar bal oldalon
  - **Tablet:** Floating toolbar (lebegő), autohide after 3 sec inactivity
  - **Mobile:** Bottom toolbar (collapsed)
- [ ] Toolbar elemek:
  - Toll szín picker (színes körök)
  - Toll vastagság slider (1-10px)
  - Radír gomb
  - Pan/Zoom mode toggle
  - Zoom +/- gombok
  - "Fit to screen" gomb
  - Mentés gomb (disabled ha nincs változás)
  - Vissza a projekt oldalra gomb
- [ ] Canvas area:
  - Teljes width/height
  - Projekt név alul fixált
  - MM grid háttér

**Deliverable:**
- `wireframes/drawing-canvas-layout-desktop.png`
- `wireframes/drawing-canvas-layout-tablet.png`
- `wireframes/drawing-canvas-layout-mobile.png`

**Időtartam:** 3 óra

---

#### FELADAT UX-02: Drawing List View Wireframe

**Részfeladatok:**
- [ ] Rajz lista megjelenítése projekt részletek oldalon
- [ ] Layout döntés:
  - **Desktop:** Grid view (3 columns)
  - **Tablet:** Grid view (2 columns)
  - **Mobile:** List view (1 column, vertical cards)
- [ ] Drawing Card tartalom:
  - Thumbnail preview (200x280px)
  - Rajz név (editable, click to edit)
  - Létrehozás dátuma
  - Papír méret badge (A4/A3)
  - Orientáció ikon (portrait/landscape)
  - Action buttons:
    - "Szerkesztés" (primary button)
    - "Törlés" (danger button)
    - "PDF Export" (secondary button)
- [ ] "Új rajz" CTA button:
  - Prominens pozíció (top right vagy floating)
  - Large touch target (56x56px tablet-en)
- [ ] Empty state:
  - Ikon (empty canvas illustration)
  - "Nincs még rajzod. Kezdj el rajzolni!"
  - "Új rajz" button

**Deliverable:**
- `wireframes/drawing-list-view-desktop.png`
- `wireframes/drawing-list-view-tablet.png`
- `wireframes/drawing-list-view-mobile.png`

**Időtartam:** 2.5 óra

---

#### FELADAT UX-03: Drawing Toolbar Components Design

**Részfeladatok:**
- [ ] Szín választó (Color Picker):
  - Preset színek display:
    - Fekete (#000000)
    - Piros (#FF0000)
    - Kék (#0000FF)
    - Zöld (#00FF00)
    - Sárga (#FFFF00)
    - Szürke (#808080)
  - Layout: 6 színes kör (40x40px), horizontális vagy grid
  - Active state: border highlight (2px ring)
  - Touch target: 44x44px
- [ ] Vastagság slider (Stroke Width):
  - Range: 1-10px
  - Visual preview: kis kör változó mérettel
  - Labels: "Vékony" (1px) / "Vastag" (10px)
- [ ] Tool buttons:
  - Toll ikon (active state: filled)
  - Radír ikon
  - Pan ikon
  - Zoom in (+)
  - Zoom out (-)
  - Fit screen ikon
  - Size: 48x48px button, 24x24px icon
- [ ] Tailwind classes:
  ```
  Color button: "w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-400"
  Active color: "border-blue-500 ring-2 ring-blue-300"
  Tool button: "p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200"
  Active tool: "bg-blue-100 text-blue-600"
  ```

**Deliverable:**
- `docs/drawing-toolbar-components.md` (Tailwind classes-szel)

**Időtartam:** 2 óra

---

#### FELADAT UX-04: Paper Size & Orientation Selector

**Részfeladatok:**
- [ ] Méret választó UI:
  - Toggle buttons: [A4] [A3]
  - Active state: filled background
  - Desktop: inline toolbar
  - Mobile: settings panel (modal)
- [ ] Orientáció választó:
  - Icon-based toggle: [Portrait icon] [Landscape icon]
  - Portrait: 📄 (vertical rectangle)
  - Landscape: 📃 (horizontal rectangle)
  - Active state: blue fill
- [ ] Elhelyezés:
  - Desktop: Toolbar top section
  - Tablet: Floating toolbar vagy settings menu
  - Mobile: Settings modal
- [ ] Visual feedback:
  - Canvas frame változik méret váltáskor
  - Transition animation (0.3s)
- [ ] Tailwind classes:
  ```
  Toggle group: "inline-flex rounded-lg border border-gray-300 bg-white p-1"
  Toggle button: "px-4 py-2 rounded-md text-sm font-medium"
  Active: "bg-blue-100 text-blue-700"
  Inactive: "text-gray-700 hover:bg-gray-50"
  ```

**Deliverable:**
- `wireframes/paper-size-selector.png`
- `docs/paper-size-selector-component.md`

**Időtartam:** 1.5 óra

---

#### FELADAT UX-05: PDF Export Modal Design

**Részfeladatok:**
- [ ] Export modal layout:
  - Title: "PDF Exportálás"
  - Drawing preview thumbnail (small)
  - Rajz neve (editable input)
  - Papír méret selector (A4/A3 radio vagy toggle)
  - Orientáció selector (Portrait/Landscape)
  - "Letöltés PDF" button (primary, full width)
  - "Mégse" button
- [ ] Loading state:
  - Spinner + "PDF generálása..."
  - Progress bar (opcionális)
  - Button disabled during generation
- [ ] Success state:
  - Checkmark ikon
  - "PDF sikeresen letöltve!" message
  - Auto-close after 2 sec
- [ ] Multiple export (post-MVP):
  - Checkbox list rajzokból
  - "Export kiválasztott rajzok" button
  - Batch progress bar
- [ ] Tailwind modal structure:
  ```
  Overlay: "fixed inset-0 bg-black bg-opacity-50 z-50"
  Modal: "fixed inset-0 flex items-center justify-center p-4"
  Content: "bg-white rounded-lg shadow-xl max-w-md w-full p-6"
  ```

**Deliverable:**
- `wireframes/pdf-export-modal.png`
- `docs/pdf-export-modal-component.md`

**Időtartam:** 2 óra

---

#### FELADAT UX-06: MM Grid Background Design

**Részfeladatok:**
- [ ] 1mm x 1mm rács specifikáció:
  - Grid size: 11.8px (1mm @ 300 DPI)
  - Line color: light gray (#E5E7EB)
  - Line width: 0.5px
- [ ] Vastagabb vonal minden 10mm-enként:
  - 10mm = 118px
  - Line color: medium gray (#D1D5DB)
  - Line width: 1px
- [ ] Rács rendering módszer:
  - **Option A:** SVG pattern (performant, skálázható)
  - **Option B:** Canvas drawing (flexibilis)
  - **DÖNTÉS:** SVG pattern (jobb performance)
- [ ] Zoom behavior:
  - Rács skálázódik proportionally
  - Mindig látható, de nem tolakodó
  - Zoom < 50%: csak vastagabb vonalak
  - Zoom > 200%: mindkét vonal típus
- [ ] PDF export behavior:
  - Rács beágyazva a PDF-be
  - Nyomtatáskor méretarányos (1mm = 1mm fizikai)

**Deliverable:**
- `docs/mm-grid-design-spec.md`

**Időtartam:** 1.5 óra

---

#### FELADAT UX-07: Responsive Breakpoints & Touch Gestures

**Részfeladatok:**
- [ ] Responsive breakpoints:
  - **Mobile:** < 768px
    - Vertical layout
    - Bottom toolbar (collapsed, expandable)
    - Canvas full viewport height
    - Single column drawing list
  - **Tablet:** 768px - 1024px
    - Landscape optimalizált
    - Floating toolbar (autohide)
    - Canvas teljes képernyő
    - 2 column drawing list
  - **Desktop:** > 1024px
    - Sidebar + canvas layout
    - Toolbar always visible
    - 3 column drawing list
- [ ] Touch gestures dokumentálása:
  - **1 ujj:**
    - Draw mode: rajzolás
    - Pan mode: eltolás
  - **2 ujj:**
    - Drag: pan (minden módban)
    - Pinch: zoom in/out
  - **3 ujj (opcionális):**
    - Tap: undo last stroke
- [ ] Gesture conflict elkerülés:
  - Mode toggle: Draw mode ↔ Pan mode
  - Visual indicator (toolbar icon highlight)
  - Tablet-en: hosszú press → mode switch
- [ ] Prevent default gestures:
  - CSS: `touch-action: none` on canvas
  - Prevent double-tap zoom
  - Prevent pull-to-refresh

**Deliverable:**
- `docs/drawing-responsive-behavior.md`
- `docs/touch-gestures-spec.md`

**Időtartam:** 2 óra

---

### 3️⃣ Backend Engineer - API & Database Implementation

#### FELADAT BE-01: Drawings Table Implementálás

**Részfeladatok:**
- [ ] Enum típusok létrehozása:
  ```sql
  CREATE TYPE paper_size_enum AS ENUM ('a4', 'a3');
  CREATE TYPE paper_orientation_enum AS ENUM ('portrait', 'landscape');
  ```
- [ ] `drawings` tábla létrehozása:
  ```sql
  CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Alaprajz',
    canvas_data JSONB NOT NULL DEFAULT '{"version":"1.0","strokes":[],"metadata":{}}',
    paper_size paper_size_enum NOT NULL DEFAULT 'a4',
    orientation paper_orientation_enum NOT NULL DEFAULT 'portrait',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
  );
  ```
- [ ] Index-ek létrehozása:
  ```sql
  CREATE INDEX idx_drawings_project_id ON drawings(project_id);
  CREATE INDEX idx_drawings_deleted_at ON drawings(deleted_at);
  CREATE INDEX idx_drawings_created_by ON drawings(created_by);
  ```
- [ ] Updated_at trigger létrehozása (használva létező function-t)
- [ ] Test: tábla sikeresen létrejött, constraint-ek működnek

**Deliverable:**
- `supabase/schema_drawings.sql` (végrehajtva)

**Időtartam:** 1 óra

---

#### FELADAT BE-02: RLS Policies - Drawings Table

**Részfeladatok:**
- [ ] RLS engedélyezése:
  ```sql
  ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
  ```
- [ ] SELECT policy:
  ```sql
  CREATE POLICY "drawings_select_policy" ON drawings
  FOR SELECT
  USING (
    -- User látja saját projekt rajzait
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = drawings.project_id
        AND projects.owner_id = auth.uid()
        AND drawings.deleted_at IS NULL
      )
    )
    OR
    -- Admin mindent lát
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    )
  );
  ```
- [ ] INSERT policy:
  ```sql
  CREATE POLICY "drawings_insert_policy" ON drawings
  FOR INSERT
  WITH CHECK (
    -- User és Admin hozhat létre
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'user')
      )
    )
    AND
    -- Csak saját projekthez (vagy admin)
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = drawings.project_id
        AND (projects.owner_id = auth.uid() OR (
          SELECT role FROM users WHERE id = auth.uid()
        ) = 'admin')
      )
    )
  );
  ```
- [ ] UPDATE policy:
  ```sql
  CREATE POLICY "drawings_update_policy" ON drawings
  FOR UPDATE
  USING (
    -- Csak owner vagy admin
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = drawings.project_id
        AND projects.owner_id = auth.uid()
      )
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    )
  );
  ```
- [ ] DELETE policy (soft delete via UPDATE):
  ```sql
  CREATE POLICY "drawings_delete_policy" ON drawings
  FOR UPDATE
  USING (
    -- Csak owner vagy admin törölhet (soft delete = UPDATE deleted_at)
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = drawings.project_id
        AND projects.owner_id = auth.uid()
      )
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    )
  );
  ```
- [ ] Test: RLS policies minden role-lal (admin, user, viewer)

**Deliverable:**
- `supabase/policies_drawings.sql` (végrehajtva)

**Időtartam:** 2 óra

---

#### FELADAT BE-03: Drawing Auto-naming Function

**Részfeladatok:**
- [ ] Function létrehozása:
  ```sql
  CREATE OR REPLACE FUNCTION generate_drawing_name(proj_id UUID)
  RETURNS TEXT AS $$
  DECLARE
    count INTEGER;
  BEGIN
    -- Számoljuk meg a projekt nem törölt rajzait
    SELECT COUNT(*) INTO count
    FROM drawings
    WHERE project_id = proj_id
    AND deleted_at IS NULL;
    
    -- Első rajz: "Alaprajz", további: "Alaprajz 2", "Alaprajz 3"
    IF count = 0 THEN
      RETURN 'Alaprajz';
    ELSE
      RETURN 'Alaprajz ' || (count + 1)::TEXT;
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  ```
- [ ] Trigger létrehozása (opcionális, vagy client-side hívás):
  ```sql
  CREATE OR REPLACE FUNCTION set_default_drawing_name()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.name = 'Alaprajz' THEN
      NEW.name := generate_drawing_name(NEW.project_id);
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE TRIGGER auto_name_drawing
    BEFORE INSERT ON drawings
    FOR EACH ROW
    EXECUTE FUNCTION set_default_drawing_name();
  ```
- [ ] Test: új rajz létrehozásakor auto name generálódik

**Deliverable:**
- `supabase/functions_drawings.sql` (végrehajtva)

**Időtartam:** 1 óra

---

#### FELADAT BE-04: Canvas Data Validation

**Részfeladatok:**
- [ ] JSONB constraint hozzáadása (opcionális, basic validation):
  ```sql
  ALTER TABLE drawings
  ADD CONSTRAINT canvas_data_check
  CHECK (
    jsonb_typeof(canvas_data) = 'object'
    AND canvas_data ? 'version'
    AND canvas_data ? 'strokes'
    AND canvas_data ? 'metadata'
  );
  ```
- [ ] Max size consideration:
  - JSONB column max: ~1GB (Postgres limit)
  - Practical limit: 5MB/rajz
  - Client-side validation előnyben (ne érjen el 5MB-ot backend-re)
- [ ] Sanitization:
  - JSONB automatikusan escape-eli a string-eket
  - XSS védelem: ne legyen szükség server-side sanitizációra

**Deliverable:**
- Validation logic `supabase/schema_drawings.sql`-ben

**Időtartam:** 30 perc

---

#### FELADAT BE-05: Test Data Seed - Drawings

**Részfeladatok:**
- [ ] 2-3 minta rajz beszúrása:
  ```sql
  INSERT INTO drawings (project_id, name, canvas_data, paper_size, orientation, created_by)
  VALUES
  (
    (SELECT id FROM projects WHERE name ILIKE '%test%' LIMIT 1),
    'Alaprajz',
    '{"version":"1.0","strokes":[{"id":"1","points":[[100,100],[200,200]],"color":"#000000","width":2}],"metadata":{"canvas_width":2480,"canvas_height":3508,"grid_size":11.8}}',
    'a4',
    'portrait',
    (SELECT id FROM users WHERE email = 'user@example.com')
  ),
  (
    (SELECT id FROM projects WHERE name ILIKE '%test%' LIMIT 1),
    'Alaprajz 2',
    '{"version":"1.0","strokes":[],"metadata":{"canvas_width":2480,"canvas_height":3508,"grid_size":11.8}}',
    'a4',
    'landscape',
    (SELECT id FROM users WHERE email = 'user@example.com')
  );
  ```
- [ ] Test: seed data sikeresen beszúródott

**Deliverable:**
- `supabase/seed_drawings.sql` (végrehajtva)

**Időtartam:** 30 perc

---

### 4️⃣ Frontend Engineer - Drawing Module Implementation

#### FELADAT FE-01: Drawing Module Folder Structure

**Részfeladatok:**
- [ ] Folder struktúra létrehozása:
  ```
  app/
    dashboard/
      projects/
        [id]/
          drawings/
            page.tsx                    # Drawing list page
            [drawing_id]/
              page.tsx                  # Drawing editor page
  
  components/
    drawings/
      DrawingCanvas.tsx                 # Main canvas component
      DrawingToolbar.tsx                # Toolbar with all tools
      DrawingList.tsx                   # Drawing grid/list view
      DrawingCard.tsx                   # Single drawing card
      ColorPicker.tsx                   # Color selector
      StrokeWidthSlider.tsx             # Width slider
      PaperSizeSelector.tsx             # Paper size & orientation selector
      PDFExportModal.tsx                # PDF export dialog
      DeleteDrawingModal.tsx            # Delete confirmation
  
  lib/
    drawings/
      api.ts                            # Supabase CRUD functions
      types.ts                          # TypeScript interfaces
      canvas-utils.ts                   # Canvas calculations
      pdf-export.ts                     # PDF generation
      gesture-handlers.ts               # Touch gesture logic
  ```
- [ ] Minden mappa és file létrehozása (még üres)

**Deliverable:**
- Teljes folder struktúra

**Időtartam:** 15 perc

---

#### FELADAT FE-02: Install Dependencies - Drawing Libraries

**Részfeladatok:**
- [ ] react-konva és konva telepítése:
  ```bash
  npm install react-konva konva
  ```
- [ ] jsPDF telepítése:
  ```bash
  npm install jspdf
  ```
- [ ] react-color telepítése (optional, ha használjuk):
  ```bash
  npm install react-color
  npm install -D @types/react-color
  ```
- [ ] TypeScript types:
  ```bash
  npm install -D @types/react-konva
  ```
- [ ] Verify: dependencies megjelentek `package.json`-ban

**Deliverable:**
- Frissített `package.json`

**Időtartam:** 15 perc

---

#### FELADAT FE-03: TypeScript Interfaces - Drawing Types

**Részfeladatok:**
- [ ] `lib/drawings/types.ts` létrehozása:
  ```typescript
  export type PaperSize = 'a4' | 'a3';
  export type PaperOrientation = 'portrait' | 'landscape';
  export type DrawingTool = 'pen' | 'eraser' | 'pan';
  
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface Stroke {
    id: string;
    points: number[]; // Flattened array: [x1, y1, x2, y2, ...]
    color: string;
    width: number;
    timestamp: string;
  }
  
  export interface CanvasMetadata {
    canvas_width: number;
    canvas_height: number;
    grid_size: number;
  }
  
  export interface CanvasData {
    version: string;
    strokes: Stroke[];
    metadata: CanvasMetadata;
  }
  
  export interface Drawing {
    id: string;
    project_id: string;
    name: string;
    canvas_data: CanvasData;
    paper_size: PaperSize;
    orientation: PaperOrientation;
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }
  
  export interface CreateDrawingInput {
    project_id: string;
    name?: string;
    paper_size?: PaperSize;
    orientation?: PaperOrientation;
  }
  
  export interface UpdateDrawingInput {
    name?: string;
    canvas_data?: CanvasData;
    paper_size?: PaperSize;
    orientation?: PaperOrientation;
  }
  ```

**Deliverable:**
- `lib/drawings/types.ts`

**Időtartam:** 30 perc

---

#### FELADAT FE-04: Supabase API - Drawing CRUD Functions

**Részfeladatok:**
- [ ] `lib/drawings/api.ts` létrehozása:
  ```typescript
  import { createClient } from '@/lib/supabase';
  import type { Drawing, CreateDrawingInput, UpdateDrawingInput } from './types';
  
  export async function getDrawings(projectId: string): Promise<Drawing[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Drawing[];
  }
  
  export async function getDrawing(drawingId: string): Promise<Drawing> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .eq('id', drawingId)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data as Drawing;
  }
  
  export async function createDrawing(input: CreateDrawingInput): Promise<Drawing> {
    const supabase = createClient();
    
    const defaultCanvasData = {
      version: '1.0',
      strokes: [],
      metadata: {
        canvas_width: input.orientation === 'landscape' ? 3508 : 2480,
        canvas_height: input.orientation === 'landscape' ? 2480 : 3508,
        grid_size: 11.8,
      },
    };
    
    const { data, error } = await supabase
      .from('drawings')
      .insert({
        project_id: input.project_id,
        name: input.name || 'Alaprajz',
        canvas_data: defaultCanvasData,
        paper_size: input.paper_size || 'a4',
        orientation: input.orientation || 'portrait',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Drawing;
  }
  
  export async function updateDrawing(
    drawingId: string,
    input: UpdateDrawingInput
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('drawings')
      .update(input)
      .eq('id', drawingId);
    
    if (error) throw error;
  }
  
  export async function deleteDrawing(drawingId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('drawings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', drawingId);
    
    if (error) throw error;
  }
  ```
- [ ] Error handling minden function-ben
- [ ] Test: functions compile without errors

**Deliverable:**
- `lib/drawings/api.ts`

**Időtartam:** 2 óra

---

#### FELADAT FE-05: Canvas Utils - Size Calculations

**Részfeladatok:**
- [ ] `lib/drawings/canvas-utils.ts` létrehozása:
  ```typescript
  import type { PaperSize, PaperOrientation } from './types';
  
  // Canvas size in pixels at 300 DPI
  // A4: 210mm x 297mm = 2480px x 3508px
  // A3: 297mm x 420mm = 3508px x 4960px
  
  export const PAPER_SIZES = {
    a4: {
      portrait: { width: 2480, height: 3508 },
      landscape: { width: 3508, height: 2480 },
    },
    a3: {
      portrait: { width: 3508, height: 4960 },
      landscape: { width: 4960, height: 3508 },
    },
  } as const;
  
  export const GRID_SIZE_MM = 1; // 1mm grid
  export const GRID_SIZE_PX = 11.8; // 1mm at 300 DPI ≈ 11.8px
  
  export function getCanvasSize(
    paperSize: PaperSize,
    orientation: PaperOrientation
  ) {
    return PAPER_SIZES[paperSize][orientation];
  }
  
  export function calculateCanvasScale(
    canvasWidth: number,
    canvasHeight: number,
    containerWidth: number,
    containerHeight: number,
    padding: number = 40
  ): number {
    const scaleX = (containerWidth - padding * 2) / canvasWidth;
    const scaleY = (containerHeight - padding * 2) / canvasHeight;
    return Math.min(scaleX, scaleY, 1); // Max 1 (100%)
  }
  ```

**Deliverable:**
- `lib/drawings/canvas-utils.ts`

**Időtartam:** 30 perc

---

#### FELADAT FE-06: Drawing List Page Implementation

**Részfeladatok:**
- [ ] `app/dashboard/projects/[id]/drawings/page.tsx`:
  ```typescript
  'use client';
  
  import { useEffect, useState } from 'react';
  import { useParams, useRouter } from 'next/navigation';
  import { getDrawings, createDrawing } from '@/lib/drawings/api';
  import DrawingList from '@/components/drawings/DrawingList';
  import type { Drawing } from '@/lib/drawings/types';
  import { showSuccess, showError } from '@/lib/toast';
  import { t } from '@/lib/translations';
  
  export default function DrawingsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    
    useEffect(() => {
      loadDrawings();
    }, [projectId]);
    
    const loadDrawings = async () => {
      try {
        const data = await getDrawings(projectId);
        setDrawings(data);
      } catch (error) {
        showError('Rajzok betöltése sikertelen');
      } finally {
        setLoading(false);
      }
    };
    
    const handleCreateDrawing = async () => {
      setCreating(true);
      try {
        const newDrawing = await createDrawing({ project_id: projectId });
        showSuccess(t('drawings.created'));
        router.push(`/dashboard/projects/${projectId}/drawings/${newDrawing.id}`);
      } catch (error) {
        showError('Rajz létrehozása sikertelen');
        setCreating(false);
      }
    };
    
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Betöltés...</div>;
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('drawings.title')}</h1>
          <button
            onClick={handleCreateDrawing}
            disabled={creating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Létrehozás...' : t('drawings.new_drawing')}
          </button>
        </div>
        
        <DrawingList
          drawings={drawings}
          projectId={projectId}
          onRefresh={loadDrawings}
        />
      </div>
    );
  }
  ```

**Deliverable:**
- `app/dashboard/projects/[id]/drawings/page.tsx`

**Időtartam:** 1.5 óra

---

#### FELADAT FE-07: DrawingList & DrawingCard Components

**Részfeladatok:**
- [ ] `components/drawings/DrawingList.tsx`:
  ```typescript
  import DrawingCard from './DrawingCard';
  import type { Drawing } from '@/lib/drawings/types';
  import { t } from '@/lib/translations';
  
  interface DrawingListProps {
    drawings: Drawing[];
    projectId: string;
    onRefresh: () => void;
  }
  
  export default function DrawingList({ drawings, projectId, onRefresh }: DrawingListProps) {
    if (drawings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="w-24 h-24 text-gray-300 mb-4" /* Empty state icon */></svg>
          <p className="text-gray-500 text-lg">{t('drawings.no_drawings')}</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map((drawing) => (
          <DrawingCard
            key={drawing.id}
            drawing={drawing}
            projectId={projectId}
            onDelete={onRefresh}
          />
        ))}
      </div>
    );
  }
  ```
  
- [ ] `components/drawings/DrawingCard.tsx`:
  ```typescript
  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { deleteDrawing, updateDrawing } from '@/lib/drawings/api';
  import DeleteDrawingModal from './DeleteDrawingModal';
  import PDFExportModal from './PDFExportModal';
  import type { Drawing } from '@/lib/drawings/types';
  import { showSuccess, showError } from '@/lib/toast';
  import { t } from '@/lib/translations';
  
  interface DrawingCardProps {
    drawing: Drawing;
    projectId: string;
    onDelete: () => void;
  }
  
  export default function DrawingCard({ drawing, projectId, onDelete }: DrawingCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(drawing.name);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    
    const handleNameSave = async () => {
      try {
        await updateDrawing(drawing.id, { name: editedName });
        showSuccess('Név módosítva');
        setIsEditing(false);
        onDelete(); // Refresh list
      } catch (error) {
        showError('Név módosítása sikertelen');
      }
    };
    
    const handleDelete = async () => {
      try {
        await deleteDrawing(drawing.id);
        showSuccess(t('drawings.deleted'));
        onDelete();
      } catch (error) {
        showError('Törlés sikertelen');
      }
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Thumbnail */}
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {/* TODO: Canvas preview vagy placeholder */}
          <span className="text-gray-400">Rajz előnézet</span>
        </div>
        
        {/* Info */}
        <div className="p-4">
          {/* Name (editable) */}
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="w-full text-lg font-semibold border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold cursor-pointer hover:text-blue-600"
            >
              {drawing.name}
            </h3>
          )}
          
          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">{drawing.paper_size.toUpperCase()}</span>
            <span>{drawing.orientation === 'portrait' ? '📄' : '📃'}</span>
            <span className="ml-auto">{new Date(drawing.created_at).toLocaleDateString('hu-HU')}</span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push(`/dashboard/projects/${projectId}/drawings/${drawing.id}`)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('drawings.edit_drawing')}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              PDF
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              🗑️
            </button>
          </div>
        </div>
        
        {/* Modals */}
        {showDeleteModal && (
          <DeleteDrawingModal
            drawingName={drawing.name}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
        
        {showExportModal && (
          <PDFExportModal
            drawing={drawing}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    );
  }
  ```

**Deliverable:**
- `components/drawings/DrawingList.tsx`
- `components/drawings/DrawingCard.tsx`

**Időtartam:** 3 óra

---

#### FELADAT FE-08: DeleteDrawingModal Component

**Részfeladatok:**
- [ ] `components/drawings/DeleteDrawingModal.tsx`:
  ```typescript
  import { t } from '@/lib/translations';
  
  interface DeleteDrawingModalProps {
    drawingName: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  export default function DeleteDrawingModal({
    drawingName,
    onConfirm,
    onCancel,
  }: DeleteDrawingModalProps) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">{t('drawings.delete_drawing')}</h2>
          <p className="text-gray-700 mb-6">
            {t('drawings.delete_confirm')} <strong>{drawingName}</strong>?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Mégse
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Törlés
            </button>
          </div>
        </div>
      </div>
    );
  }
  ```

**Deliverable:**
- `components/drawings/DeleteDrawingModal.tsx`

**Időtartam:** 30 perc

---

#### FELADAT FE-09: Drawing Editor Page - Basic Setup

**Részfeladatok:**
- [ ] `app/dashboard/projects/[id]/drawings/[drawing_id]/page.tsx`:
  ```typescript
  'use client';
  
  import { useEffect, useState } from 'react';
  import { useParams, useRouter } from 'next/navigation';
  import dynamic from 'next/dynamic';
  import { getDrawing, updateDrawing } from '@/lib/drawings/api';
  import type { Drawing, CanvasData } from '@/lib/drawings/types';
  import { showSuccess, showError } from '@/lib/toast';
  
  // Dynamic import - Canvas csak client-side
  const DrawingCanvas = dynamic(() => import('@/components/drawings/DrawingCanvas'), {
    ssr: false,
  });
  
  export default function DrawingEditorPage() {
    const params = useParams();
    const router = useRouter();
    const drawingId = params.drawing_id as string;
    const projectId = params.id as string;
    
    const [drawing, setDrawing] = useState<Drawing | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
      loadDrawing();
    }, [drawingId]);
    
    const loadDrawing = async () => {
      try {
        const data = await getDrawing(drawingId);
        setDrawing(data);
      } catch (error) {
        showError('Rajz betöltése sikertelen');
        router.push(`/dashboard/projects/${projectId}/drawings`);
      } finally {
        setLoading(false);
      }
    };
    
    const handleSave = async (canvasData: CanvasData) => {
      setSaving(true);
      try {
        await updateDrawing(drawingId, { canvas_data: canvasData });
        showSuccess('Rajz mentve!');
      } catch (error) {
        showError('Mentés sikertelen');
      } finally {
        setSaving(false);
      }
    };
    
    const handleBack = () => {
      router.push(`/dashboard/projects/${projectId}/drawings`);
    };
    
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Betöltés...</div>;
    }
    
    if (!drawing) {
      return null;
    }
    
    return (
      <div className="h-screen flex flex-col">
        <DrawingCanvas
          drawing={drawing}
          onSave={handleSave}
          onBack={handleBack}
          saving={saving}
        />
      </div>
    );
  }
  ```

**Deliverable:**
- `app/dashboard/projects/[id]/drawings/[drawing_id]/page.tsx`

**Időtartam:** 1 óra

---

#### FELADAT FE-10: DrawingCanvas Component - Basic Structure

**Részfeladatok:**
- [ ] `components/drawings/DrawingCanvas.tsx` alapstruktúra:
  ```typescript
  import { useState, useRef, useEffect } from 'react';
  import { Stage, Layer, Line } from 'react-konva';
  import type { Drawing, CanvasData, Stroke, DrawingTool, PaperSize, PaperOrientation } from '@/lib/drawings/types';
  import { getCanvasSize } from '@/lib/drawings/canvas-utils';
  import DrawingToolbar from './DrawingToolbar';
  
  interface DrawingCanvasProps {
    drawing: Drawing;
    onSave: (canvasData: CanvasData) => void;
    onBack: () => void;
    saving: boolean;
  }
  
  export default function DrawingCanvas({ drawing, onSave, onBack, saving }: DrawingCanvasProps) {
    // Canvas state
    const [strokes, setStrokes] = useState<Stroke[]>(drawing.canvas_data.strokes);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    
    // Tool state
    const [tool, setTool] = useState<DrawingTool>('pen');
    const [color, setColor] = useState('#000000');
    const [width, setWidth] = useState(2);
    
    // Paper settings
    const [paperSize, setPaperSize] = useState<PaperSize>(drawing.paper_size);
    const [orientation, setOrientation] = useState<PaperOrientation>(drawing.orientation);
    
    // Zoom/Pan state
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    
    const isDrawing = useRef(false);
    
    const { width: canvasWidth, height: canvasHeight } = getCanvasSize(paperSize, orientation);
    
    // Save handler
    const handleSave = () => {
      const canvasData: CanvasData = {
        version: '1.0',
        strokes: strokes,
        metadata: {
          canvas_width: canvasWidth,
          canvas_height: canvasHeight,
          grid_size: 11.8,
        },
      };
      onSave(canvasData);
    };
    
    // TODO: Implement drawing handlers, zoom/pan, etc.
    
    return (
      <div className="relative w-full h-full bg-gray-100">
        {/* Toolbar */}
        <DrawingToolbar
          tool={tool}
          color={color}
          width={width}
          paperSize={paperSize}
          orientation={orientation}
          onToolChange={setTool}
          onColorChange={setColor}
          onWidthChange={setWidth}
          onPaperSizeChange={setPaperSize}
          onOrientationChange={setOrientation}
          onSave={handleSave}
          onBack={onBack}
          saving={saving}
        />
        
        {/* Canvas */}
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
        >
          {/* Grid Layer */}
          <Layer>
            {/* TODO: Grid rendering */}
          </Layer>
          
          {/* Drawing Layer */}
          <Layer>
            {/* Render strokes */}
            {strokes.map((stroke) => (
              <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                lineCap="round"
                lineJoin="round"
              />
            ))}
            
            {/* Current stroke */}
            {currentStroke && (
              <Line
                points={currentStroke.points}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.width}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
  ```

**Deliverable:**
- `components/drawings/DrawingCanvas.tsx` (basic structure)

**Időtartam:** 2 óra

---

**Megjegyzés:** A Frontend Engineer további feladatai (FE-11 - FE-25) folytatódnak a következő részben, beleértve:
- MM Grid rendering
- Drawing event handlers
- Toolbar components (ColorPicker, StrokeWidthSlider, etc.)
- Pan & Zoom implementation
- Touch gesture handling
- PDF Export
- Hungarian translations
- Responsive optimizations

Az egyes feladatok részletesen ki vannak fejtve a teljes tervben, időbecslésekkel és deliverable-ökkel együtt.

---

## 📊 Összesített Timeline

| Fázis | Időtartam | Agent-ek |
|-------|-----------|----------|
| **Design & Planning** | 1-2 nap | System Architect, UX/UI Designer |
| **Backend Implementation** | 1-2 nap | Backend Engineer |
| **Frontend Implementation** | 5-7 nap | Frontend Engineer |
| **Security & QA** | 2-3 nap | Security Analyst, QA Tester |
| **Deployment** | 1 nap | DevOps Engineer |
| **ÖSSZESEN** | **10-15 nap** | |

---

## ✅ Definition of Done - Drawing Module MVP

### Funkcionális követelmények:
- [ ] User tud rajzolni szabadkézzel (ujj/stylus/egér)
- [ ] Toll szín és vastagság állítható
- [ ] Pan & zoom működik (touch + mouse)
- [ ] Tablet-optimalizált UI
- [ ] Rajzok menthetők és szerkeszthetők
- [ ] MM papír háttér látható és skálázódik
- [ ] Projekt név megjelenik rajzlapon
- [ ] Több rajz létrehozható/kezelhető
- [ ] Rajz név szerkeszthető
- [ ] Rajzok törölhetők (soft delete)
- [ ] Egyedi rajz PDF export
- [ ] A4 méret, álló/fekvő váltás
- [ ] Magyar UI

### Nem-funkcionális követelmények:
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Touch gestures (1 ujj draw, 2 ujj pan/zoom)
- [ ] Performance: 60 FPS (< 500 stroke)
- [ ] Security: RLS policies működnek
- [ ] E2E tesztek sikeresek
- [ ] Browser compatibility
- [ ] Production ready (Netlify)

---

**🚀 Kezdés:** System Architect és UX/UI Designer párhuzamosan indulhat!