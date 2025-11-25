-- =============================================================================
-- MIGRATION: Create Photos Table
-- =============================================================================
-- Date: 2025-10-28
-- Description: Creates the photos table for local file storage
-- This migration can be run on existing databases
-- =============================================================================

-- =============================================================================
-- 1. CREATE PHOTOS TABLE (IDEMPOTENT)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.photos (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project relationship
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL DEFAULT '', -- Path in Supabase Storage (legacy, default empty)
  local_file_path TEXT,               -- Path in local Docker volume (new)
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

-- =============================================================================
-- 2. CREATE INDEXES (IDEMPOTENT)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_photos_project_id ON public.photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- =============================================================================
-- 3. ADD COMMENTS
-- =============================================================================

COMMENT ON TABLE public.photos IS 'Project photos - supports both Supabase Storage and local file storage';
COMMENT ON COLUMN public.photos.file_path IS 'Path in Supabase Storage (legacy support for old photos)';
COMMENT ON COLUMN public.photos.local_file_path IS 'Filename in local Docker volume /app/uploads (new approach)';
COMMENT ON COLUMN public.photos.thumbnail_path IS 'Filename of thumbnail image in /app/uploads/thumbnails';

-- =============================================================================
-- 4. CREATE UPDATED_AT TRIGGER (IDEMPOTENT)
-- =============================================================================

DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ENABLE RLS AND CREATE POLICIES (IDEMPOTENT)
-- =============================================================================

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS photos_select_policy ON public.photos;
DROP POLICY IF EXISTS photos_insert_policy ON public.photos;
DROP POLICY IF EXISTS photos_update_policy ON public.photos;
DROP POLICY IF EXISTS photos_delete_policy ON public.photos;

-- SELECT policy: Users see their own photos + viewer/admin see all
CREATE POLICY photos_select_policy
ON public.photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.photos.project_id
      AND public.projects.owner_id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('viewer', 'admin')
);

-- INSERT policy: Users can upload to their own projects + admin to any
CREATE POLICY photos_insert_policy
ON public.photos
FOR INSERT
WITH CHECK (
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
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- UPDATE policy: Users can update their own photos + admin can update any
CREATE POLICY photos_update_policy
ON public.photos
FOR UPDATE
USING (
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
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- DELETE policy: Users can delete their own photos + admin can delete any
CREATE POLICY photos_delete_policy
ON public.photos
FOR DELETE
USING (
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
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- =============================================================================
-- 6. GRANT PERMISSIONS
-- =============================================================================

GRANT ALL ON public.photos TO authenticated;
GRANT ALL ON public.photos TO postgres;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'photos') THEN
    RAISE NOTICE '✓ Photos table created successfully';
  ELSE
    RAISE EXCEPTION '✗ Photos table creation failed';
  END IF;
END $$;
