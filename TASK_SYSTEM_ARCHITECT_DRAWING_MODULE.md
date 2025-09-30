# System Architect - Drawing Module Feladatok

**Projekt:** Moduláris WebApp MVP - Drawing Module (Felmérés Rajzoló Modul)
**Fázis:** FÁZIS 0 - Design & Planning
**Agent:** System-Architect-Agent
**Időkeret:** 7 óra (1 nap)

---

## 🎯 Projekt Kontextus

**Tech Stack:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + react-konva + jsPDF
- Backend: Supabase (PostgreSQL + RLS)
- Deployment: Netlify
- UI: Magyar, Code: English

**Kapcsolódó Projekt Döntések:**
- **Auto ID formátum:** `PROJ-YYYYMMDD-NNN` (már implementálva a projects táblában)
- **Soft Delete:** `deleted_at` timestamp oszlop (már használatban)
- **User Roles:** Admin, User, Viewer (3 roles)
- **Module System:** Database-driven (modules + user_module_activations táblák)

**Drawing Module Scope (MVP v1.0):**
- Alapvető rajzolás (toll, szín, vastagság, radír)
- Pan & Zoom (touch + mouse)
- Tablet-optimalizált UI
- MM papír háttér
- Projekt név megjelenítése rajzlapon
- Több rajz CRUD művelet
- Egyedi rajz PDF export
- A4 méret, álló/fekvő váltás

---

## 📝 Feladatok (SA-01 - SA-04)

### FELADAT SA-01: Database Schema - Drawings Table (2 óra)

**Részfeladatok:**

1. **Enum típusok tervezése:**
   - `paper_size_enum`: 'a4', 'a3'
   - `paper_orientation_enum`: 'portrait', 'landscape'

2. **`drawings` tábla tervezése:**
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

3. **Index-ek tervezése:**
   - `idx_drawings_project_id` ON `drawings(project_id)`
   - `idx_drawings_deleted_at` ON `drawings(deleted_at)`
   - `idx_drawings_created_by` ON `drawings(created_by)`

4. **RLS Policies vázlat:**
   - **SELECT:** User látja saját projekt rajzait (owner_id check), Admin mindent
   - **INSERT:** User/Admin hozhat létre, csak saját projekthez
   - **UPDATE:** Csak owner vagy Admin szerkeszthet
   - **DELETE (soft):** Csak owner vagy Admin törölhet (UPDATE deleted_at)

**Deliverable:**
- `/home/velvet/building-survey/supabase/schema_drawings.sql`
- `/home/velvet/building-survey/supabase/policies_drawings.sql` (policies vázlat, majd BE-02-ben véglegesítve)

---

### FELADAT SA-02: Canvas Data Format Specifikáció (1.5 óra)

**Részfeladatok:**

1. **Rajz adat struktúra JSON formátumban:**
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
       "grid_size": 11.8
     }
   }
   ```

2. **Stroke optimalizálás megfontolások:**
   - Bezier curve simplification (későbbi verzió)
   - Points array optimalizálás (remove redundant points)

3. **Max file size limit:**
   - JSONB column max: ~1GB (Postgres limit)
   - Praktikus limit: 5MB/rajz
   - Client-side validation előnyben (ne érjen el 5MB-ot backend-re)

4. **Canvas méretek (300 DPI):**
   - A4 portrait: 2480px x 3508px (210mm x 297mm)
   - A4 landscape: 3508px x 2480px
   - A3 portrait: 3508px x 4960px (297mm x 420mm)
   - A3 landscape: 4960px x 3508px

**Deliverable:**
- `/home/velvet/building-survey/docs/canvas-data-format.md`

---

### FELADAT SA-03: Tech Stack Döntések - Canvas Library (2 óra)

**Részfeladatok:**

1. **Canvas rendering library kiválasztása és indoklás:**
   - **Option A:** HTML5 Canvas API (natív, lightweight, de sok low-level kód)
   - **Option B:** Fabric.js (feature-rich, de nagyobb bundle, kevésbé React-friendly)
   - **Option C:** Konva.js (react-konva) - **JAVASOLT DÖNTÉS:**
     - ✅ React integráció (`react-konva`)
     - ✅ Jó performance
     - ✅ Built-in zoom/pan support
     - ✅ Touch/gesture support
     - ✅ TypeScript support
     - ✅ Kisebb bundle mint Fabric.js
   - **DÖNTÉS:** `react-konva` + `konva`

2. **PDF generation library:**
   - **DÖNTÉS:** `jsPDF` - előnyök:
     - ✅ Client-side generálás (nem kell backend endpoint)
     - ✅ Könnyű használat
     - ✅ Canvas to image conversion support
     - ✅ Text és vector graphics support

3. **Touch/gesture handling:**
   - React Touch Events + custom hooks
   - Konva native touch support használata
   - `touch-action: none` CSS a canvas-en

4. **Dependencies listája:**
   ```json
   {
     "dependencies": {
       "react-konva": "^18.x",
       "konva": "^9.x",
       "jspdf": "^2.x"
     },
     "devDependencies": {
       "@types/react-konva": "^18.x"
     }
   }
   ```

**Deliverable:**
- `/home/velvet/building-survey/docs/drawing-module-tech-stack.md`

---

### FELADAT SA-04: API Endpoint Struktúra (1.5 óra)

**Részfeladatok:**

1. **Drawing CRUD endpoints dokumentálása:**
   ```
   GET    /api/projects/:project_id/drawings        - Lista lekérése
   POST   /api/projects/:project_id/drawings        - Új rajz létrehozása
   GET    /api/drawings/:id                         - Egyedi rajz lekérése
   PATCH  /api/drawings/:id                         - Rajz frissítése
   DELETE /api/drawings/:id                         - Rajz törlése (soft)
   ```

   Megjegyzés: Ezek Supabase client-side CRUD calls lesznek, nem Next.js API routes (kivéve ha szükséges).

2. **Request/Response format példák:**

   **POST /api/projects/:project_id/drawings:**
   ```typescript
   Request: {
     name?: string,
     paper_size?: 'a4' | 'a3',
     orientation?: 'portrait' | 'landscape'
   }

   Response: {
     id: uuid,
     name: string,
     project_id: uuid,
     canvas_data: jsonb,
     paper_size: 'a4' | 'a3',
     orientation: 'portrait' | 'landscape',
     created_at: timestamp,
     updated_at: timestamp
   }
   ```

   **PATCH /api/drawings/:id:**
   ```typescript
   Request: {
     canvas_data?: jsonb,
     name?: string,
     paper_size?: 'a4' | 'a3',
     orientation?: 'portrait' | 'landscape'
   }

   Response: {
     success: boolean,
     updated_at: timestamp
   }
   ```

   **GET /api/projects/:project_id/drawings:**
   ```typescript
   Response: [
     {
       id: uuid,
       name: string,
       paper_size: 'a4' | 'a3',
       orientation: 'portrait' | 'landscape',
       created_at: timestamp,
       updated_at: timestamp
     },
     ...
   ]
   ```

3. **PDF Export handling:**
   - Client-side generálás (jsPDF)
   - Nincs backend endpoint szükséges
   - Canvas → Image → PDF pipeline

**Deliverable:**
- `/home/velvet/building-survey/docs/drawing-api-spec.md`

---

## 🚨 Kritikus Követelmények

1. **Követd a projektfeladat.md-ben definiált role leírást** (System-Architect-Agent.md)
2. **Minden SQL script executable formátumban** (nem csak vázlat)
3. **RLS Policies figyelembe veszik a 3 role-t:** Admin, User, Viewer
4. **Soft delete pattern:** `deleted_at` oszlop, NULL = aktív
5. **Magyar kommentek SQL-ben és dokumentációban** (ahol értelmes)
6. **TypeScript interface-ek compatibility:** Supabase auto-generated types-szal

---

## ✅ Sikerkritériumok

- ✅ `drawings` tábla séma executable SQL-ként
- ✅ RLS policies definiálva (később BE-02-ben véglegesítve)
- ✅ Canvas data format specifikálva JSON example-lel
- ✅ Tech stack döntések indokolva
- ✅ API endpoint struktúra dokumentálva
- ✅ Minden deliverable file létrehozva a megfelelő mappában

---

## 📌 Megjegyzések

- **NINCS implementáció** - csak tervezés és dokumentáció!
- Backend Engineer fogja végrehajtani a SQL script-eket (FÁZIS 1)
- UX/UI Designer párhuzamosan dolgozik a wireframe-eken
- Várható befejezés: **7 óra (1 nap)**

---

**Kezd el a munkát és térj vissza a deliverable-ökkel!**