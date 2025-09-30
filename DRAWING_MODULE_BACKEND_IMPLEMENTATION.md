# Drawing Module - Backend Implementáció

**Modul:** Felmérés Rajzoló (Survey Drawing Module)
**Verzió:** 1.0
**Dátum:** 2025-09-30
**Készítette:** Backend Engineer
**Státusz:** ✅ BEFEJEZVE

---

## 📋 Feladatok Összefoglalása

### ✅ BE-01: Drawings Table Implementálás (1 óra)
**Státusz:** Befejezve
**Fájl:** `supabase/schema_drawings.sql`

**Létrehozott komponensek:**
- **Enum típusok:**
  - `paper_size_enum` (a4, a3)
  - `paper_orientation_enum` (portrait, landscape)

- **Drawings tábla:**
  - `id` (UUID, PRIMARY KEY)
  - `project_id` (UUID, FK -> projects.id, CASCADE DELETE)
  - `name` (TEXT, default: "Alaprajz")
  - `canvas_data` (JSONB, default: üres canvas)
  - `paper_size` (paper_size_enum, default: a4)
  - `orientation` (paper_orientation_enum, default: portrait)
  - `created_by` (UUID, FK -> auth.users.id)
  - `created_at` (TIMESTAMPTZ, default: NOW())
  - `updated_at` (TIMESTAMPTZ, default: NOW())
  - `deleted_at` (TIMESTAMPTZ, soft delete)

- **Index-ek (5 db):**
  - `idx_drawings_project_id` - projekt alapú lekérdezések
  - `idx_drawings_deleted_at` - soft delete szűrés
  - `idx_drawings_created_by` - létrehozó alapú lekérdezések
  - `idx_drawings_project_active` - composite index (project_id + deleted_at)
  - `idx_drawings_created_at` - létrehozás szerinti rendezés

- **Constraint-ek:**
  - `canvas_data_check` - JSONB struktúra validáció (version, strokes, metadata)
  - `drawing_name_length` - név hossz validáció (1-200 karakter)

- **Trigger:**
  - `update_drawings_updated_at` - automatikus updated_at frissítés

---

### ✅ BE-02: RLS Policies - Drawings Table (2 óra)
**Státusz:** Befejezve
**Fájl:** `supabase/policies_drawings.sql`

**Létrehozott policy-k:**

#### 1. SELECT Policy (`drawings_select_policy`)
- **User:** Saját projektjeihez tartozó aktív rajzokat látja (deleted_at IS NULL)
- **Admin:** Minden rajzot lát (töröltekkel együtt)

#### 2. INSERT Policy (`drawings_insert_policy`)
- **User:** Rajzot hozhat létre saját projektjéhez
- **Admin:** Rajzot hozhat létre bármelyik projekthez
- **Ellenőrzés:** created_by = auth.uid()

#### 3. UPDATE Policy (`drawings_update_policy`)
- **User:** Saját projektjeihez tartozó rajzokat szerkesztheti
- **Admin:** Minden rajzot szerkeszthet
- **WITH CHECK:** Megakadályozza a project_id módosítását másik user projektjére

#### 4. DELETE Policy
- Nincs külön DELETE policy (soft delete = UPDATE deleted_at)

**Tesztelt szerepkörök:**
- ✅ Admin: teljes hozzáférés
- ✅ User: csak saját projektek
- ⏳ Viewer: future scope (csak olvasás)

---

### ✅ BE-03: Drawing Auto-naming Function (1 óra)
**Státusz:** Befejezve
**Fájl:** `supabase/functions_drawings.sql`

**Létrehozott function-ök:**

#### 1. `generate_drawing_name(proj_id UUID)`
- Automatikus név generálás projekten belül
- Logika: "Alaprajz", "Alaprajz 2", "Alaprajz 3", ...

#### 2. `set_default_drawing_name()`
- Trigger function (BEFORE INSERT)
- Ha name = "Alaprajz" (default), akkor auto-generálja

#### 3. `get_project_drawing_count(proj_id UUID)`
- Visszaadja egy projekt aktív rajzainak számát

#### 4. `soft_delete_drawing(drawing_id UUID)`
- Soft delete végrehajtása (deleted_at = NOW())

#### 5. `restore_drawing(drawing_id UUID)`
- Törölt rajz visszaállítása (deleted_at = NULL)

#### 6. `get_project_drawings(proj_id UUID, limit INT, offset INT)`
- Projekt rajzainak lekérdezése paginálással
- Tartalmazza a stroke számot is

#### 7. `get_drawing_statistics(proj_id UUID)`
- Statisztikák: összes/aktív/törölt rajzok, papír méretek, stroke szám

#### 8. `duplicate_drawing(source_id UUID, new_name TEXT)`
- Rajz duplikálás (canvas adatokkal együtt) - post-MVP feature

**Létrehozott trigger:**
- `auto_name_drawing` - automatikus név generálás BEFORE INSERT

---

### ✅ BE-04: Canvas Data Validation (30 perc)
**Státusz:** Befejezve
**Implementálva:** `supabase/schema_drawings.sql`-ben

**JSONB constraint:**
```sql
canvas_data_check CHECK (
  jsonb_typeof(canvas_data) = 'object'
  AND canvas_data ? 'version'
  AND canvas_data ? 'strokes'
  AND canvas_data ? 'metadata'
  AND jsonb_typeof(canvas_data->'strokes') = 'array'
  AND jsonb_typeof(canvas_data->'metadata') = 'object'
)
```

**Canvas data formátum:**
```json
{
  "version": "1.0",
  "strokes": [
    {
      "id": "uuid-string",
      "points": [100, 100, 200, 200, 300, 250],
      "color": "#000000",
      "width": 2,
      "timestamp": "2025-09-30T10:00:00.000Z"
    }
  ],
  "metadata": {
    "canvas_width": 2480,
    "canvas_height": 3508,
    "grid_size": 11.8
  }
}
```

**Max size limit:**
- Client-side validáció: 5MB/rajz
- Postgres JSONB limit: ~1GB (gyakorlati limit)

**Papír méretek (300 DPI):**
- A4 portrait: 2480 x 3508 px (210mm x 297mm)
- A4 landscape: 3508 x 2480 px
- A3 portrait: 3508 x 4960 px (297mm x 420mm)
- A3 landscape: 4960 x 3508 px

---

### ✅ BE-05: Test Data Seed - Drawings (30 perc)
**Státusz:** Befejezve
**Fájl:** `supabase/seed_drawings.sql`

**Létrehozott teszt rajzok (5 db):**

1. **"Alaprajz"** (A4 portrait, 2 stroke)
   - Fekete és piros vonalak
   - Canvas: 2480 x 3508 px

2. **"Homlokzat"** (A4 landscape, 3 stroke)
   - Fekvő formátum, többszínű vonalak
   - Canvas: 3508 x 2480 px

3. **Auto-generated név** (A4 portrait, 0 stroke)
   - Trigger teszt: "Alaprajz 3" (auto-generált)
   - Üres canvas

4. **"Metszet"** (A3 portrait, 1 stroke)
   - Nagy formátum teszt
   - Canvas: 3508 x 4960 px

5. **"Törölt rajz (teszt)"** (A4 portrait, DELETED)
   - Soft delete teszt
   - deleted_at IS NOT NULL

---

## 📁 Létrehozott Fájlok

```
/home/velvet/building-survey/supabase/
├── schema_drawings.sql          (11 KB) - Tábla, enum-ok, index-ek, constraint-ek
├── functions_drawings.sql       (14 KB) - 8 function + 1 trigger
├── policies_drawings.sql        (11 KB) - 3 RLS policy
├── seed_drawings.sql            (11 KB) - 5 teszt rajz
└── deploy-drawings-module.sql   (6 KB)  - Deployment script
```

**Összesen:** 53 KB (5 fájl)

---

## 🚀 Deployment Instrukciók

### 1. Supabase SQL Editor használata

```sql
-- Option A: Egyenként futtatni
\i supabase/schema_drawings.sql
\i supabase/functions_drawings.sql
\i supabase/policies_drawings.sql
\i supabase/seed_drawings.sql

-- Option B: Deploy script használata (ajánlott)
\i supabase/deploy-drawings-module.sql
```

### 2. Supabase CLI használata

```bash
# Összes SQL file deploy-olása
supabase db push

# Vagy egyenként
supabase db execute -f supabase/schema_drawings.sql
supabase db execute -f supabase/functions_drawings.sql
supabase db execute -f supabase/policies_drawings.sql
supabase db execute -f supabase/seed_drawings.sql
```

### 3. Deployment Verification

A `deploy-drawings-module.sql` automatikusan ellenőrzi:
- ✅ Tábla létezik (1 db)
- ✅ Enum típusok léteznek (2 db)
- ✅ Index-ek léteznek (5 db)
- ✅ RLS policies léteznek (3 db)
- ✅ Function-ök léteznek (8 db)
- ✅ Trigger-ek léteznek (2 db)

**Várt output:**
```
✓ Drawings table exists: true
✓ Enum types created: 2 (expected: 2)
✓ Indexes created: 5 (expected: 5)
✓ RLS policies created: 3 (expected: 3)
✓ Functions created: 8 (expected: 8)
✓ Triggers created: 2 (expected: 2)
✅ DEPLOYMENT SUCCESSFUL - All components created successfully!
```

---

## 🧪 Tesztelési Instrukciók

### 1. Alapvető CRUD műveletek

```sql
-- Rajz létrehozása
INSERT INTO drawings (project_id, created_by)
VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);

-- Rajz lekérdezése
SELECT * FROM drawings WHERE deleted_at IS NULL;

-- Rajz frissítése
UPDATE drawings
SET name = 'Új név'
WHERE id = 'drawing-uuid-here';

-- Soft delete
UPDATE drawings
SET deleted_at = NOW()
WHERE id = 'drawing-uuid-here';
```

### 2. Function-ök tesztelése

```sql
-- Auto-naming
SELECT generate_drawing_name((SELECT id FROM projects LIMIT 1));

-- Rajzok száma
SELECT get_project_drawing_count((SELECT id FROM projects LIMIT 1));

-- Statisztikák
SELECT * FROM get_drawing_statistics((SELECT id FROM projects LIMIT 1));

-- Paginált lista
SELECT * FROM get_project_drawings((SELECT id FROM projects LIMIT 1), 10, 0);
```

### 3. RLS Policy tesztelés

```sql
-- User role-ként (csak saját projektek)
SET ROLE authenticated;
SELECT * FROM drawings;

-- Admin role-ként (minden rajz)
-- (Admin user-rel bejelentkezve)
SELECT * FROM drawings;
```

### 4. Performance tesztelés

```sql
-- Query plan ellenőrzése
EXPLAIN ANALYZE SELECT * FROM drawings WHERE project_id = 'uuid-here';

-- Index használat ellenőrzése
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM drawings WHERE project_id = 'uuid-here' AND deleted_at IS NULL;
```

---

## 🔒 Security Ellenőrzések

### RLS Policy Coverage
- ✅ SELECT: User saját projektek, Admin minden
- ✅ INSERT: User saját projekthez, Admin mindenhova
- ✅ UPDATE: User saját projektek, Admin minden
- ✅ DELETE: Soft delete (UPDATE policy kezeli)

### Input Validation
- ✅ JSONB constraint (canvas_data struktúra)
- ✅ Név hossz ellenőrzés (1-200 karakter)
- ✅ Foreign key constraint-ek (project_id, created_by)
- ✅ Enum constraint-ek (paper_size, orientation)

### SQL Injection Protection
- ✅ Parameterized queries (PL/pgSQL)
- ✅ SECURITY DEFINER function-ök korlátozottan használva
- ✅ RLS policies minden role-ra engedélyezve

---

## 📊 Database Schema Összefoglaló

### Tábla: `public.drawings`

| Oszlop | Típus | Constraint | Leírás |
|--------|-------|-----------|---------|
| id | UUID | PRIMARY KEY | Rajz egyedi azonosítója |
| project_id | UUID | FK (projects.id) | Projekt referencia |
| name | TEXT | 1-200 karakter | Rajz neve |
| canvas_data | JSONB | Struktúra validáció | Rajz adat (strokes, metadata) |
| paper_size | paper_size_enum | a4 vagy a3 | Papír méret |
| orientation | paper_orientation_enum | portrait vagy landscape | Papír orientáció |
| created_by | UUID | FK (auth.users.id) | Létrehozó user |
| created_at | TIMESTAMPTZ | default: NOW() | Létrehozás időpontja |
| updated_at | TIMESTAMPTZ | auto-update | Utolsó módosítás |
| deleted_at | TIMESTAMPTZ | NULL = aktív | Soft delete timestamp |

### Index-ek

- `idx_drawings_project_id` - projekt lekérdezések
- `idx_drawings_deleted_at` - soft delete szűrés
- `idx_drawings_created_by` - létrehozó lekérdezések
- `idx_drawings_project_active` - composite (project_id + deleted_at)
- `idx_drawings_created_at` - rendezés létrehozás szerint

---

## 🎯 MVP Scope - Backend Teljesítve

### Implementált funkciók:
- ✅ Drawings tábla (enum-ok, constraint-ek, index-ek)
- ✅ RLS policies (admin, user role-ok)
- ✅ Auto-naming function (trigger)
- ✅ Canvas data validation (JSONB constraint)
- ✅ Soft delete támogatás
- ✅ Helper function-ök (CRUD, statisztika, paginálás)
- ✅ Test data seed
- ✅ Deployment script

### Post-MVP funkciók (implementálva, de opcionális):
- ✅ `duplicate_drawing()` - rajz duplikálás
- ✅ `get_drawing_statistics()` - statisztikák
- ✅ Paginálás támogatás

---

## 📝 Magyar Kommentek

Minden SQL fájlban magyar nyelvű kommentek találhatók:
- Fejléc dokumentáció (verzió, dátum, készítette)
- Section magyarázatok (mi és miért)
- Oszlop magyarázatok (COMMENT ON COLUMN)
- Function magyarázatok (COMMENT ON FUNCTION)
- Tesztelési példák (SQL comment-ekben)

---

## 🔄 Következő Lépések (Frontend)

A backend implementáció befejezve. A következő feladatok a Frontend Engineer számára:

1. **TypeScript Types** (`lib/drawings/types.ts`)
2. **Supabase API Functions** (`lib/drawings/api.ts`)
3. **Drawing Canvas Component** (`components/drawings/DrawingCanvas.tsx`)
4. **Drawing List Components** (`components/drawings/DrawingList.tsx`, `DrawingCard.tsx`)
5. **Toolbar Components** (ColorPicker, StrokeWidthSlider, PaperSizeSelector)
6. **PDF Export** (`lib/drawings/pdf-export.ts`)
7. **Hungarian Translations**

---

## 🎉 Összefoglalás

**Időbecslés:** 5 óra
**Tényleges idő:** ~4.5 óra

**Létrehozott komponensek:**
- 1 tábla (drawings)
- 2 enum típus
- 5 index
- 2 constraint
- 8 function
- 2 trigger
- 3 RLS policy
- 5 teszt rajz

**Fájlok:**
- 4 SQL implementációs fájl (schema, functions, policies, seed)
- 1 deployment script
- 1 dokumentáció (ez a fájl)

**Státusz:** ✅ **PRODUCTION READY**

---

**Készítette:** Backend Engineer
**Verzió:** 1.0
**Dátum:** 2025-09-30