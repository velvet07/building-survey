-- =============================================================================
-- Migration: Add Slugs and Local File Storage Support
-- =============================================================================
-- Date: 2025-10-26
-- Description:
--   1. Add slug field to drawings table for user-friendly URLs
--   2. Create photos table (if not exists) with local storage support
--   3. Add slug generation function for drawings
-- =============================================================================

-- =============================================================================
-- 1. ADD SLUG TO DRAWINGS TABLE
-- =============================================================================

-- Add slug column to drawings table
-- Slug is generated from the name (e.g., "Alaprajz - Pince" -> "alaprajz-pince")
ALTER TABLE public.drawings
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_drawings_slug ON public.drawings(slug);

-- Add constraint: slug must be URL-safe (lowercase, numbers, hyphens only)
ALTER TABLE public.drawings
DROP CONSTRAINT IF EXISTS drawing_slug_format;

ALTER TABLE public.drawings
ADD CONSTRAINT drawing_slug_format
CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$');

COMMENT ON COLUMN public.drawings.slug IS 'URL-friendly slug generated from name (lowercase, dash-separated)';
COMMENT ON INDEX idx_drawings_slug IS 'Index for fast slug-based lookups';

-- =============================================================================
-- 2. SLUG GENERATION FUNCTION FOR DRAWINGS
-- =============================================================================

-- Function: Generate slug from drawing name
-- Converts "Alaprajz - Pince" -> "alaprajz-pince"
-- Handles Hungarian characters: á->a, é->e, etc.
CREATE OR REPLACE FUNCTION generate_drawing_slug(drawing_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(drawing_name);

  -- Replace Hungarian characters
  slug := REPLACE(slug, 'á', 'a');
  slug := REPLACE(slug, 'é', 'e');
  slug := REPLACE(slug, 'í', 'i');
  slug := REPLACE(slug, 'ó', 'o');
  slug := REPLACE(slug, 'ö', 'o');
  slug := REPLACE(slug, 'ő', 'o');
  slug := REPLACE(slug, 'ú', 'u');
  slug := REPLACE(slug, 'ü', 'u');
  slug := REPLACE(slug, 'ű', 'u');

  -- Replace spaces and special characters with hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);

  -- Ensure slug is not empty
  IF slug = '' THEN
    slug := 'rajz';
  END IF;

  RETURN slug;
END;
$$;

COMMENT ON FUNCTION generate_drawing_slug(TEXT) IS
'Generates URL-friendly slug from drawing name (handles Hungarian characters)';

-- =============================================================================
-- 3. AUTO-GENERATE SLUG TRIGGER FOR DRAWINGS
-- =============================================================================

-- Trigger function: Auto-generate unique slug on INSERT/UPDATE
CREATE OR REPLACE FUNCTION auto_generate_drawing_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 1;
BEGIN
  -- Only generate slug if not provided or name changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND NEW.name != OLD.name) THEN
    -- Generate base slug from name
    base_slug := generate_drawing_slug(NEW.name);
    final_slug := base_slug;

    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
      SELECT 1 FROM public.drawings
      WHERE slug = final_slug
      AND id != NEW.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_generate_drawing_slug_trigger ON public.drawings;
CREATE TRIGGER auto_generate_drawing_slug_trigger
  BEFORE INSERT OR UPDATE ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_drawing_slug();

COMMENT ON FUNCTION auto_generate_drawing_slug() IS
'Trigger function: Auto-generates unique slug for drawings on INSERT/UPDATE';

-- =============================================================================
-- 4. CREATE PHOTOS TABLE (IF NOT EXISTS)
-- =============================================================================

-- Photos table for local file storage
CREATE TABLE IF NOT EXISTS public.photos (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project relationship
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage (legacy)
  local_file_path TEXT,    -- Path in local Docker volume (new)
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,

  -- Image dimensions (optional)
  width INT,
  height INT,

  -- Thumbnail (for local storage)
  thumbnail_path TEXT,

  -- Metadata
  caption TEXT,
  description TEXT,

  -- User tracking
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for photos table
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON public.photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- Comments
COMMENT ON TABLE public.photos IS 'Project photos - supports both Supabase Storage and local file storage';
COMMENT ON COLUMN public.photos.file_path IS 'Path in Supabase Storage (legacy support)';
COMMENT ON COLUMN public.photos.local_file_path IS 'Path in local Docker volume (new approach)';
COMMENT ON COLUMN public.photos.thumbnail_path IS 'Path to thumbnail image (local storage only)';

-- =============================================================================
-- 5. UPDATED_AT TRIGGER FOR PHOTOS
-- =============================================================================

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ROW LEVEL SECURITY FOR PHOTOS
-- =============================================================================

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view photos from their own projects or all projects if viewer/admin
CREATE POLICY photos_select_policy
ON public.photos
FOR SELECT
USING (
  -- User sees photos from their own projects
  (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.photos.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  -- Viewer sees all photos
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  )
  OR
  -- Admin sees all photos
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
);

-- Policy: Users can insert photos to their own projects
CREATE POLICY photos_insert_policy
ON public.photos
FOR INSERT
WITH CHECK (
  -- User role can upload to their own projects
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('user', 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.photos.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  -- Admin can upload to any project
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
);

-- Policy: Users can update their own photos
CREATE POLICY photos_update_policy
ON public.photos
FOR UPDATE
USING (
  -- User can update photos from their own projects
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('user', 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.photos.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  -- Admin can update any photo
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
);

-- Policy: Users can delete their own photos
CREATE POLICY photos_delete_policy
ON public.photos
FOR DELETE
USING (
  -- User can delete photos from their own projects
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('user', 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.photos.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  -- Admin can delete any photo
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
);

-- =============================================================================
-- 7. GRANTS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.photos TO authenticated;

-- =============================================================================
-- 8. DATA MIGRATION - GENERATE SLUGS FOR EXISTING DRAWINGS
-- =============================================================================

-- Update existing drawings with slugs
DO $$
DECLARE
  drawing_record RECORD;
BEGIN
  FOR drawing_record IN
    SELECT id, name FROM public.drawings WHERE slug IS NULL
  LOOP
    UPDATE public.drawings
    SET slug = NULL  -- Trigger will generate slug
    WHERE id = drawing_record.id;
  END LOOP;
END $$;

-- =============================================================================
-- MIGRATION SUMMARY
-- =============================================================================

-- Changes:
-- 1. Added 'slug' column to drawings table (TEXT, UNIQUE)
-- 2. Created generate_drawing_slug() function (handles Hungarian characters)
-- 3. Created auto_generate_drawing_slug_trigger (auto-generates unique slugs)
-- 4. Created photos table with local_file_path support
-- 5. Added RLS policies for photos table (user, viewer, admin roles)
-- 6. Migrated existing drawings to have slugs

-- URL Structure:
-- - Projects: /projects/proj-20251025-001 (auto-identifier)
-- - Drawings: /projects/proj-20251025-001/drawings/alaprajz-pince (slug)
-- - Photos: Stored in local Docker volume at /app/uploads

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
