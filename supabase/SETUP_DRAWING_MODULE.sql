-- =============================================================================
-- DRAWING MODULE - COMPLETE DATABASE SETUP
-- =============================================================================
-- Verzió: 1.0
-- Dátum: 2025-09-30
-- Használat: Futtasd ezt a teljes SQL fájlt a Supabase SQL Editor-ban
-- =============================================================================

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

-- Paper size enum (A4, A3)
DO $$ BEGIN
    CREATE TYPE paper_size_enum AS ENUM ('a4', 'a3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Paper orientation enum (portrait, landscape)
DO $$ BEGIN
    CREATE TYPE paper_orientation_enum AS ENUM ('portrait', 'landscape');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. DRAWINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Alaprajz',
  canvas_data JSONB NOT NULL DEFAULT '{"version":"1.0","strokes":[],"metadata":{"canvas_width":2480,"canvas_height":3508,"grid_size":11.8}}',
  paper_size paper_size_enum NOT NULL DEFAULT 'a4',
  orientation paper_orientation_enum NOT NULL DEFAULT 'portrait',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_canvas_data CHECK (
    canvas_data ? 'version' AND
    canvas_data ? 'strokes' AND
    canvas_data ? 'metadata'
  )
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON public.drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_deleted_at ON public.drawings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_drawings_created_by ON public.drawings(created_by);
CREATE INDEX IF NOT EXISTS idx_drawings_project_active ON public.drawings(project_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON public.drawings(created_at DESC);

-- =============================================================================
-- 4. RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
DROP POLICY IF EXISTS "Users can view drawings in their projects" ON public.drawings;
CREATE POLICY "Users can view drawings in their projects"
ON public.drawings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = drawings.project_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  )
);

-- INSERT Policy
DROP POLICY IF EXISTS "Users can create drawings in their projects" ON public.drawings;
CREATE POLICY "Users can create drawings in their projects"
ON public.drawings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = drawings.project_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  )
);

-- UPDATE Policy
DROP POLICY IF EXISTS "Users can update drawings in their projects" ON public.drawings;
CREATE POLICY "Users can update drawings in their projects"
ON public.drawings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = drawings.project_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  )
);

-- DELETE Policy (Soft delete via UPDATE)
DROP POLICY IF EXISTS "Users can delete drawings in their projects" ON public.drawings;
CREATE POLICY "Users can delete drawings in their projects"
ON public.drawings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = drawings.project_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  )
);

-- =============================================================================
-- 5. SECURITY TRIGGER - Force created_by
-- =============================================================================

CREATE OR REPLACE FUNCTION enforce_created_by_on_drawings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a drawing';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_created_by_trigger ON public.drawings;
CREATE TRIGGER enforce_created_by_trigger
  BEFORE INSERT ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_created_by_on_drawings();

-- =============================================================================
-- 6. AUTO-NAMING FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_drawing_name(proj_id UUID)
RETURNS TEXT AS $$
DECLARE
  drawing_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO drawing_count
  FROM public.drawings
  WHERE project_id = proj_id
    AND deleted_at IS NULL;

  IF drawing_count = 0 THEN
    RETURN 'Alaprajz';
  ELSE
    RETURN 'Alaprajz ' || (drawing_count + 1)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. AUTO-NAMING TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_default_drawing_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name = 'Alaprajz' THEN
    NEW.name := generate_drawing_name(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_name_drawing ON public.drawings;
CREATE TRIGGER auto_name_drawing
  BEFORE INSERT ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION set_default_drawing_name();

-- =============================================================================
-- 8. HELPER FUNCTIONS
-- =============================================================================

-- Get project drawing count
CREATE OR REPLACE FUNCTION get_project_drawing_count(proj_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_result
  FROM public.drawings
  WHERE project_id = proj_id
    AND deleted_at IS NULL;
  RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- Soft delete drawing
CREATE OR REPLACE FUNCTION soft_delete_drawing(drawing_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Security check
  IF NOT EXISTS (
    SELECT 1 FROM public.drawings d
    JOIN public.projects p ON d.project_id = p.id
    WHERE d.id = drawing_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not have permission to delete this drawing';
  END IF;

  UPDATE public.drawings
  SET deleted_at = NOW()
  WHERE id = drawing_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Restore drawing
CREATE OR REPLACE FUNCTION restore_drawing(drawing_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Security check
  IF NOT EXISTS (
    SELECT 1 FROM public.drawings d
    JOIN public.projects p ON d.project_id = p.id
    WHERE d.id = drawing_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not have permission to restore this drawing';
  END IF;

  UPDATE public.drawings
  SET deleted_at = NULL
  WHERE id = drawing_id
    AND deleted_at IS NOT NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 9. VERIFY INSTALLATION
-- =============================================================================

-- Check if everything was created successfully
DO $$
DECLARE
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'drawings'
  ) INTO table_exists;

  -- Check RLS is enabled
  SELECT relrowsecurity
  FROM pg_class
  WHERE relname = 'drawings'
  INTO rls_enabled;

  -- Count policies
  SELECT COUNT(*)
  FROM pg_policies
  WHERE tablename = 'drawings'
  INTO policy_count;

  -- Report
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DRAWING MODULE INSTALLATION REPORT';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Table "drawings" exists: %', table_exists;
  RAISE NOTICE 'RLS enabled: %', rls_enabled;
  RAISE NOTICE 'Number of policies: %', policy_count;
  RAISE NOTICE '==============================================';

  IF table_exists AND rls_enabled AND policy_count >= 4 THEN
    RAISE NOTICE '✓ Installation successful!';
  ELSE
    RAISE WARNING '⚠ Installation incomplete - please check logs';
  END IF;
END $$;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- Next steps:
-- 1. Refresh your application (Ctrl+R)
-- 2. Go to a project
-- 3. Click "Rajzok" module
-- 4. Click "+ Új rajz"
-- 5. Start drawing! 🎨
-- =============================================================================