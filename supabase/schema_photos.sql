-- =============================================================================
-- Photos Module - Database Schema
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-10-25
-- Készítette: Backend Engineer
-- Modul: Projekt Fotók (Project Photos Module)
-- =============================================================================

-- Megjegyzés: Ez a script tartalmazza a fotók modul database schema-ját
-- Tartalmazza: photos tábla, index-ek, constraint-ek, trigger-ek
-- Fontos: HARD DELETE - nincs soft delete (deleted_at mező)

-- =============================================================================
-- 1. PHOTOS TÁBLA LÉTREHOZÁSA
-- =============================================================================

-- Photos tábla: Projekt fotók tárolása
-- Fájlok Supabase Storage-ben (project-photos bucket)
CREATE TABLE IF NOT EXISTS public.photos (
  -- Elsődleges kulcs
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Projekt kapcsolat (CASCADE delete: ha projekt törlődik, fotók is)
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Fájl adatok
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,

  -- Opcionális metaadatok
  caption TEXT,
  description TEXT,

  -- Feltöltő user (referencia auth.users táblára)
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),

  -- Időbélyegzők
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kommentek hozzáadása
COMMENT ON TABLE public.photos IS 'Projekt fotók tárolása - fájlok Supabase Storage-ben';
COMMENT ON COLUMN public.photos.id IS 'Fotó egyedi azonosítója (UUID)';
COMMENT ON COLUMN public.photos.project_id IS 'Projekt ID (projects.id referencia)';
COMMENT ON COLUMN public.photos.file_name IS 'Eredeti fájlnév';
COMMENT ON COLUMN public.photos.file_path IS 'Fájl elérési útvonal a Storage-ben (egyedi)';
COMMENT ON COLUMN public.photos.file_size IS 'Fájl méret byte-ban';
COMMENT ON COLUMN public.photos.mime_type IS 'MIME típus (pl. image/jpeg, image/png)';
COMMENT ON COLUMN public.photos.caption IS 'Opcionális képaláírás';
COMMENT ON COLUMN public.photos.description IS 'Opcionális leírás';
COMMENT ON COLUMN public.photos.uploaded_by IS 'Fotót feltöltő user ID';
COMMENT ON COLUMN public.photos.created_at IS 'Feltöltés időpontja';
COMMENT ON COLUMN public.photos.updated_at IS 'Utolsó módosítás időpontja (automatikusan frissül)';

-- =============================================================================
-- 2. INDEX-EK LÉTREHOZÁSA
-- =============================================================================

-- Index a projekt alapú lekérdezésekhez (gyakori query)
-- SELECT * FROM photos WHERE project_id = '...'
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON public.photos(project_id);

-- Index a feltöltő alapú lekérdezésekhez
-- SELECT * FROM photos WHERE uploaded_by = '...'
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);

-- Index a létrehozás dátuma alapján (rendezéshez)
-- SELECT * FROM photos ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- Index a fájl útvonal alapján (UNIQUE constraint miatt már automatikus)
-- De explicit hivatkozás a gyors lookup érdekében

-- Kommentek hozzáadása
COMMENT ON INDEX idx_photos_project_id IS 'Index a projekt alapú lekérdezésekhez';
COMMENT ON INDEX idx_photos_uploaded_by IS 'Index a feltöltő user alapú lekérdezésekhez';
COMMENT ON INDEX idx_photos_created_at IS 'Index a feltöltés dátuma alapján történő rendezéshez';

-- =============================================================================
-- 3. FÁJL VALIDÁCIÓ CONSTRAINT-EK
-- =============================================================================

-- Constraint: fájlnév nem lehet üres és max 255 karakter
ALTER TABLE public.photos
ADD CONSTRAINT photo_file_name_length
CHECK (
  char_length(file_name) >= 1
  AND char_length(file_name) <= 255
);

-- Constraint: file_path nem lehet üres és max 500 karakter
ALTER TABLE public.photos
ADD CONSTRAINT photo_file_path_length
CHECK (
  char_length(file_path) >= 1
  AND char_length(file_path) <= 500
);

-- Constraint: MIME típus validáció (csak kép formátumok)
ALTER TABLE public.photos
ADD CONSTRAINT photo_mime_type_valid
CHECK (
  mime_type IN (
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  )
);

-- Constraint: caption max 500 karakter (ha megadva)
ALTER TABLE public.photos
ADD CONSTRAINT photo_caption_length
CHECK (
  caption IS NULL
  OR char_length(caption) <= 500
);

-- Constraint: description max 2000 karakter (ha megadva)
ALTER TABLE public.photos
ADD CONSTRAINT photo_description_length
CHECK (
  description IS NULL
  OR char_length(description) <= 2000
);

-- Kommentek hozzáadása
COMMENT ON CONSTRAINT photo_file_name_length ON public.photos IS
'Fájlnév hossz validáció: 1-255 karakter';

COMMENT ON CONSTRAINT photo_file_path_length ON public.photos IS
'Fájl útvonal hossz validáció: 1-500 karakter';

COMMENT ON CONSTRAINT photo_mime_type_valid ON public.photos IS
'MIME típus validáció: csak támogatott kép formátumok';

COMMENT ON CONSTRAINT photo_caption_length ON public.photos IS
'Képaláírás hossz validáció: max 500 karakter';

COMMENT ON CONSTRAINT photo_description_length ON public.photos IS
'Leírás hossz validáció: max 2000 karakter';

-- =============================================================================
-- 4. UPDATED_AT TRIGGER LÉTREHOZÁSA
-- =============================================================================

-- Trigger a photos táblához (használja a meglévő update_updated_at_column() function-t)
-- Automatikusan frissíti az updated_at mezőt minden UPDATE esetén
DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Komment hozzáadása
COMMENT ON TRIGGER update_photos_updated_at ON public.photos IS
'Automatikusan frissíti az updated_at mezőt minden UPDATE esetén';

-- =============================================================================
-- 5. ROW LEVEL SECURITY ENGEDÉLYEZÉSE
-- =============================================================================

-- RLS engedélyezése a photos táblára
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Policy: Authenticated users láthatják saját projektjeik fotóit
DROP POLICY IF EXISTS "Users can view photos of their own projects" ON public.photos;
CREATE POLICY "Users can view photos of their own projects"
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = photos.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- Policy: Authenticated users feltölthetnek fotókat saját projektjeikhez
DROP POLICY IF EXISTS "Users can upload photos to their own projects" ON public.photos;
CREATE POLICY "Users can upload photos to their own projects"
  ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = photos.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- Policy: Authenticated users frissíthetik saját projektjeik fotóit
DROP POLICY IF EXISTS "Users can update photos of their own projects" ON public.photos;
CREATE POLICY "Users can update photos of their own projects"
  ON public.photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = photos.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = photos.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- Policy: Authenticated users törölhetik saját projektjeik fotóit
DROP POLICY IF EXISTS "Users can delete photos from their own projects" ON public.photos;
CREATE POLICY "Users can delete photos from their own projects"
  ON public.photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = photos.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- Kommentek hozzáadása
COMMENT ON POLICY "Users can view photos of their own projects" ON public.photos IS
'Authenticated users láthatják saját projektjeik fotóit';

COMMENT ON POLICY "Users can upload photos to their own projects" ON public.photos IS
'Authenticated users feltölthetnek fotókat saját projektjeikhez';

COMMENT ON POLICY "Users can update photos of their own projects" ON public.photos IS
'Authenticated users frissíthetik saját projektjeik fotóinak metaadatait';

COMMENT ON POLICY "Users can delete photos from their own projects" ON public.photos IS
'Authenticated users törölhetik saját projektjeik fotóit (HARD DELETE)';

-- =============================================================================
-- 7. GRANTS - Alapértelmezett jogosultságok
-- =============================================================================

-- Authenticated user-ek számára alapértelmezett jogosultságok
GRANT ALL ON public.photos TO authenticated;

-- =============================================================================
-- 8. SECURITY: ENFORCE uploaded_by TRIGGER
-- =============================================================================

-- Trigger function: Force uploaded_by to auth.uid() for security
-- This prevents client-side manipulation of the uploaded_by field
CREATE OR REPLACE FUNCTION enforce_uploaded_by_on_photos()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set uploaded_by to the current authenticated user
  NEW.uploaded_by := auth.uid();

  -- If no user is authenticated, raise an exception
  IF NEW.uploaded_by IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to upload a photo';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger: Enforce uploaded_by on INSERT
DROP TRIGGER IF EXISTS enforce_uploaded_by_trigger ON public.photos;
CREATE TRIGGER enforce_uploaded_by_trigger
  BEFORE INSERT ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION enforce_uploaded_by_on_photos();

COMMENT ON FUNCTION enforce_uploaded_by_on_photos() IS
'Security trigger: Forces uploaded_by to auth.uid() to prevent client-side manipulation';

COMMENT ON TRIGGER enforce_uploaded_by_trigger ON public.photos IS
'Enforces that uploaded_by is always set to the authenticated user ID';

-- =============================================================================
-- PHOTOS SCHEMA ÖSSZEFOGLALÓ
-- =============================================================================

-- Létrehozott tábla:
-- 1. public.photos (Fotók táblája)

-- Index-ek:
-- 1. idx_photos_project_id (project_id oszlop)
-- 2. idx_photos_uploaded_by (uploaded_by oszlop)
-- 3. idx_photos_created_at (created_at oszlop, DESC rendezéssel)
-- 4. UNIQUE index file_path oszlopon (automatikus)

-- Constraint-ek:
-- 1. photo_file_name_length (Fájlnév hossz: 1-255 karakter)
-- 2. photo_file_path_length (Fájl útvonal hossz: 1-500 karakter)
-- 3. photo_mime_type_valid (MIME típus: csak kép formátumok)
-- 4. photo_caption_length (Képaláírás: max 500 karakter)
-- 5. photo_description_length (Leírás: max 2000 karakter)
-- 6. file_size > 0 (Fájl méret pozitív)
-- 7. FK: project_id -> projects(id) ON DELETE CASCADE
-- 8. FK: uploaded_by -> auth.users(id)

-- Trigger-ek:
-- 1. update_photos_updated_at (Auto-update updated_at)
-- 2. enforce_uploaded_by_trigger (Security: force uploaded_by to auth.uid())

-- RLS Policies:
-- 1. Users can view photos of their own projects
-- 2. Users can upload photos to their own projects
-- 3. Users can update photos of their own projects
-- 4. Users can delete photos from their own projects

-- Támogatott MIME típusok:
-- - image/jpeg, image/jpg
-- - image/png
-- - image/gif
-- - image/webp
-- - image/heic, image/heif

-- Fájl méret limit:
-- - Client-side validáció: 10MB per fotó
-- - Max batch upload: 20 fotó

-- Storage bucket:
-- - Név: project-photos
-- - Public: false (csak authenticated users)
-- - File size limit: 10MB

-- =============================================================================
-- STORAGE BUCKET SETUP (Supabase Dashboard-on kell végrehajtani)
-- =============================================================================

-- 1. Bucket létrehozása:
--    - Név: project-photos
--    - Public: false
--    - File size limit: 10MB
--    - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif

-- 2. Storage Policies (RLS):
--    - SELECT: authenticated users láthatják saját projektjeik fotóit
--    - INSERT: authenticated users feltölthetnek fotókat saját projektjeikhez
--    - UPDATE: nincs (fotók nem módosíthatók)
--    - DELETE: authenticated users törölhetik saját projektjeik fotóit

-- =============================================================================
-- END OF PHOTOS SCHEMA
-- =============================================================================
