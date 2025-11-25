-- =============================================================================
-- Drawing Module - Database Schema
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-30
-- Készítette: Backend Engineer
-- Modul: Felmérés Rajzoló (Survey Drawing Module)
-- =============================================================================

-- Megjegyzés: Ez a script tartalmazza a rajzolás modul database schema-ját
-- Tartalmazza: enum típusok, drawings tábla, index-ek, constraint-ek

-- =============================================================================
-- 1. ENUM TÍPUSOK LÉTREHOZÁSA
-- =============================================================================

-- Papír méret enum típus (A4, A3)
-- MVP: A4 és A3 támogatás
CREATE TYPE paper_size_enum AS ENUM ('a4', 'a3');

-- Papír orientáció enum típus (Álló, Fekvő)
CREATE TYPE paper_orientation_enum AS ENUM ('portrait', 'landscape');

-- Kommentek hozzáadása
COMMENT ON TYPE paper_size_enum IS 'Papír méret típusok: a4 (210x297mm), a3 (297x420mm)';
COMMENT ON TYPE paper_orientation_enum IS 'Papír orientáció típusok: portrait (álló), landscape (fekvő)';

-- =============================================================================
-- 2. DRAWINGS TÁBLA LÉTREHOZÁSA
-- =============================================================================

-- Drawings tábla: Projekt rajzok tárolása
-- Canvas adat JSON formátumban (strokes, metadata)
CREATE TABLE IF NOT EXISTS public.drawings (
  -- Elsődleges kulcs
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Projekt kapcsolat (CASCADE delete: ha projekt törlődik, rajzok is)
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Rajz neve (alapértelmezett: "Alaprajz", auto-generált trigger-rel)
  name TEXT NOT NULL DEFAULT 'Alaprajz',

  -- Canvas adat JSONB formátumban
  -- Struktúra: {"version":"1.0", "strokes":[...], "metadata":{...}}
  canvas_data JSONB NOT NULL DEFAULT '{"version":"1.0","strokes":[],"metadata":{"canvas_width":2480,"canvas_height":3508,"grid_size":11.8}}',

  -- Papír méret (alapértelmezett: A4)
  paper_size paper_size_enum NOT NULL DEFAULT 'a4',

  -- Papír orientáció (alapértelmezett: álló/portrait)
  orientation paper_orientation_enum NOT NULL DEFAULT 'portrait',

  -- Létrehozó user (referencia auth.users táblára)
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Időbélyegzők
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete timestamp (NULL = aktív, NOT NULL = törölt)
  deleted_at TIMESTAMPTZ
);

-- Kommentek hozzáadása
COMMENT ON TABLE public.drawings IS 'Projekt rajzok tárolása - felmérési rajzok canvas adatokkal';
COMMENT ON COLUMN public.drawings.id IS 'Rajz egyedi azonosítója (UUID)';
COMMENT ON COLUMN public.drawings.project_id IS 'Projekt ID (projektek.id referencia)';
COMMENT ON COLUMN public.drawings.name IS 'Rajz neve (szerkeszthető, alapértelmezett: "Alaprajz")';
COMMENT ON COLUMN public.drawings.canvas_data IS 'Canvas rajz adat JSONB formátumban (strokes, metadata)';
COMMENT ON COLUMN public.drawings.paper_size IS 'Papír méret (a4, a3)';
COMMENT ON COLUMN public.drawings.orientation IS 'Papír orientáció (portrait/álló, landscape/fekvő)';
COMMENT ON COLUMN public.drawings.created_by IS 'Rajzot létrehozó user ID';
COMMENT ON COLUMN public.drawings.created_at IS 'Létrehozás időpontja';
COMMENT ON COLUMN public.drawings.updated_at IS 'Utolsó módosítás időpontja (automatikusan frissül)';
COMMENT ON COLUMN public.drawings.deleted_at IS 'Soft delete időbélyeg (NULL = aktív, NOT NULL = törölt)';

-- =============================================================================
-- 3. INDEX-EK LÉTREHOZÁSA
-- =============================================================================

-- Index a projekt alapú lekérdezésekhez (gyakori query)
-- SELECT * FROM drawings WHERE project_id = '...' AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON public.drawings(project_id);

-- Index a soft delete szűréshez
-- SELECT * FROM drawings WHERE deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_drawings_deleted_at ON public.drawings(deleted_at);

-- Index a létrehozó alapú lekérdezésekhez
-- SELECT * FROM drawings WHERE created_by = '...'
CREATE INDEX IF NOT EXISTS idx_drawings_created_by ON public.drawings(created_by);

-- Composite index: projekt + deleted_at (optimalizált lekérdezéshez)
-- SELECT * FROM drawings WHERE project_id = '...' AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_drawings_project_active ON public.drawings(project_id, deleted_at);

-- Index a létrehozás dátuma alapján (rendezéshez)
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON public.drawings(created_at DESC);

-- Kommentek hozzáadása
COMMENT ON INDEX idx_drawings_project_id IS 'Index a projekt alapú lekérdezésekhez';
COMMENT ON INDEX idx_drawings_deleted_at IS 'Index a soft delete szűréshez';
COMMENT ON INDEX idx_drawings_created_by IS 'Index a létrehozó user alapú lekérdezésekhez';
COMMENT ON INDEX idx_drawings_project_active IS 'Composite index: projekt + aktív rajzok';
COMMENT ON INDEX idx_drawings_created_at IS 'Index a létrehozás dátuma alapján történő rendezéshez';

-- =============================================================================
-- 4. CANVAS DATA VALIDATION CONSTRAINT
-- =============================================================================

-- JSONB constraint: ellenőrzi, hogy a canvas_data valid struktúrájú-e
-- Kötelező mezők: version, strokes (array), metadata (object)
ALTER TABLE public.drawings
ADD CONSTRAINT canvas_data_check
CHECK (
  -- canvas_data object típusú
  jsonb_typeof(canvas_data) = 'object'
  -- van 'version' mező
  AND canvas_data ? 'version'
  -- van 'strokes' mező
  AND canvas_data ? 'strokes'
  -- van 'metadata' mező
  AND canvas_data ? 'metadata'
  -- 'strokes' array típusú
  AND jsonb_typeof(canvas_data->'strokes') = 'array'
  -- 'metadata' object típusú
  AND jsonb_typeof(canvas_data->'metadata') = 'object'
);

-- Komment hozzáadása
COMMENT ON CONSTRAINT canvas_data_check ON public.drawings IS
'Ellenőrzi a canvas_data JSONB struktúráját (version, strokes array, metadata object)';

-- =============================================================================
-- 5. RAJZ NÉV ELLENŐRZÉSE
-- =============================================================================

-- Constraint: rajz név nem lehet üres és max 200 karakter
ALTER TABLE public.drawings
ADD CONSTRAINT drawing_name_length
CHECK (
  char_length(name) >= 1
  AND char_length(name) <= 200
);

-- Komment hozzáadása
COMMENT ON CONSTRAINT drawing_name_length ON public.drawings IS
'Rajz név hossz validáció: 1-200 karakter';

-- =============================================================================
-- 6. UPDATED_AT TRIGGER LÉTREHOZÁSA
-- =============================================================================

-- Trigger a drawings táblához (használja a meglévő update_updated_at_column() function-t)
-- Automatikusan frissíti az updated_at mezőt minden UPDATE esetén
DROP TRIGGER IF EXISTS update_drawings_updated_at ON public.drawings;
CREATE TRIGGER update_drawings_updated_at
  BEFORE UPDATE ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Komment hozzáadása
COMMENT ON TRIGGER update_drawings_updated_at ON public.drawings IS
'Automatikusan frissíti az updated_at mezőt minden UPDATE esetén';

-- =============================================================================
-- 7. ROW LEVEL SECURITY ENGEDÉLYEZÉSE
-- =============================================================================

-- RLS engedélyezése a drawings táblára
-- Megjegyzés: A konkrét policy-k a policies_drawings.sql fájlban találhatók
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. GRANTS - Alapértelmezett jogosultságok
-- =============================================================================

-- Authenticated user-ek számára alapértelmezett jogosultságok
GRANT ALL ON public.drawings TO authenticated;

-- =============================================================================
-- DRAWINGS SCHEMA ÖSSZEFOGLALÓ
-- =============================================================================

-- Létrehozott enum típusok:
-- 1. paper_size_enum (a4, a3)
-- 2. paper_orientation_enum (portrait, landscape)

-- Létrehozott tábla:
-- 1. public.drawings (Rajzok táblája)

-- Index-ek:
-- 1. idx_drawings_project_id (project_id oszlop)
-- 2. idx_drawings_deleted_at (deleted_at oszlop)
-- 3. idx_drawings_created_by (created_by oszlop)
-- 4. idx_drawings_project_active (project_id + deleted_at composite)
-- 5. idx_drawings_created_at (created_at oszlop, DESC rendezéssel)

-- Constraint-ek:
-- 1. canvas_data_check (JSONB struktúra validáció)
-- 2. drawing_name_length (Név hossz validáció: 1-200 karakter)
-- 3. FK: project_id -> projects(id) ON DELETE CASCADE
-- 4. FK: created_by -> auth.users(id)

-- Trigger-ek:
-- 1. update_drawings_updated_at (Auto-update updated_at)

-- Canvas data limit:
-- - Maximális rajz méret: 5MB (client-side validáció)
-- - JSONB column: ~1GB (Postgres limit)

-- =============================================================================
-- CANVAS DATA FORMÁTUM DOKUMENTÁCIÓ
-- =============================================================================

-- Canvas data JSON struktúra példa:
-- {
--   "version": "1.0",
--   "strokes": [
--     {
--       "id": "uuid-string",
--       "points": [100, 100, 200, 200, 300, 250],
--       "color": "#000000",
--       "width": 2,
--       "timestamp": "2025-09-30T10:00:00.000Z"
--     }
--   ],
--   "metadata": {
--     "canvas_width": 2480,
--     "canvas_height": 3508,
--     "grid_size": 11.8
--   }
-- }

-- Metadata mező magyarázat:
-- - canvas_width: Canvas szélessége pixelben (300 DPI)
-- - canvas_height: Canvas magassága pixelben (300 DPI)
-- - grid_size: Rács méret pixelben (1mm = 11.8px @ 300 DPI)

-- Papír méretek (300 DPI-ben):
-- - A4 portrait: 2480 x 3508 px (210mm x 297mm)
-- - A4 landscape: 3508 x 2480 px
-- - A3 portrait: 3508 x 4960 px (297mm x 420mm)
-- - A3 landscape: 4960 x 3508 px

-- =============================================================================
-- SECURITY: ENFORCE created_by TRIGGER
-- =============================================================================

-- Trigger function: Validate created_by field
-- Hybrid approach: works with both Supabase auth and local PostgreSQL
-- Priority: Use provided created_by value, fallback to auth.uid() if available
CREATE OR REPLACE FUNCTION enforce_created_by_on_drawings()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is already set (passed from application), use it
  -- This is required for local PostgreSQL where auth.uid() doesn't exist
  IF NEW.created_by IS NULL THEN
    -- Try to get from Supabase auth (if available)
    BEGIN
      NEW.created_by := auth.uid();
    EXCEPTION
      WHEN undefined_function THEN
        -- auth.uid() doesn't exist in local PostgreSQL
        NULL;
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  -- Validate that created_by is set
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a drawing';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger: Enforce created_by on INSERT
DROP TRIGGER IF EXISTS enforce_created_by_trigger ON public.drawings;
CREATE TRIGGER enforce_created_by_trigger
  BEFORE INSERT ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_created_by_on_drawings();

COMMENT ON FUNCTION enforce_created_by_on_drawings() IS
'Security trigger: Validates created_by field. Uses provided value from application or falls back to auth.uid() if available. Works with both local PostgreSQL and Supabase.';

COMMENT ON TRIGGER enforce_created_by_trigger ON public.drawings IS
'Validates that created_by is set to an authenticated user ID (hybrid approach for local/cloud)';

-- =============================================================================
-- END OF DRAWINGS SCHEMA
-- =============================================================================