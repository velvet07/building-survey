-- =============================================================================
-- PHOTOS TABLE INITIALIZATION
-- =============================================================================
-- Date: 2025-10-28
-- Description: Photos table with local file storage support
-- =============================================================================

-- =============================================================================
-- 1. CREATE PHOTOS TABLE
-- =============================================================================

-- Photos table for local file storage
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
-- 2. INDEXES
-- =============================================================================

-- Indexes for photos table
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON public.photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- =============================================================================
-- 3. COMMENTS
-- =============================================================================

COMMENT ON TABLE public.photos IS 'Project photos - supports both Supabase Storage and local file storage';
COMMENT ON COLUMN public.photos.id IS 'Primary key (UUID)';
COMMENT ON COLUMN public.photos.project_id IS 'Foreign key to projects table';
COMMENT ON COLUMN public.photos.file_name IS 'Original file name';
COMMENT ON COLUMN public.photos.file_path IS 'Path in Supabase Storage (legacy support for old photos)';
COMMENT ON COLUMN public.photos.local_file_path IS 'Filename in local Docker volume /app/uploads (new approach)';
COMMENT ON COLUMN public.photos.thumbnail_path IS 'Filename of thumbnail image in /app/uploads/thumbnails';
COMMENT ON COLUMN public.photos.file_size IS 'File size in bytes';
COMMENT ON COLUMN public.photos.mime_type IS 'MIME type (e.g. image/jpeg)';
COMMENT ON COLUMN public.photos.width IS 'Image width in pixels';
COMMENT ON COLUMN public.photos.height IS 'Image height in pixels';
COMMENT ON COLUMN public.photos.caption IS 'User-provided caption';
COMMENT ON COLUMN public.photos.description IS 'User-provided description';
COMMENT ON COLUMN public.photos.uploaded_by IS 'User who uploaded the photo';
COMMENT ON COLUMN public.photos.created_at IS 'Upload timestamp';
COMMENT ON COLUMN public.photos.updated_at IS 'Last update timestamp';

-- =============================================================================
-- 4. UPDATED_AT TRIGGER
-- =============================================================================

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view photos from their own projects or all projects if viewer/admin
DROP POLICY IF EXISTS photos_select_policy ON public.photos;
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
DROP POLICY IF EXISTS photos_insert_policy ON public.photos;
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
DROP POLICY IF EXISTS photos_update_policy ON public.photos;
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
DROP POLICY IF EXISTS photos_delete_policy ON public.photos;
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
-- 6. GRANTS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.photos TO authenticated;
GRANT ALL ON public.photos TO postgres;

-- =============================================================================
-- END OF PHOTOS TABLE INITIALIZATION
-- =============================================================================
