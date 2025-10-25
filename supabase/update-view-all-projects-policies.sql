-- =============================================================================
-- Update RLS Policies to Allow All Users to View All Projects
-- =============================================================================
-- Purpose: Update RLS policies so that all authenticated users can view
--          all projects, drawings, and form responses (not just their own)
--          but still restrict create/update/delete to project owners.
-- Date: 2025-10-25
-- =============================================================================

-- =============================================================================
-- 1. PROJECTS TABLE - UPDATE SELECT POLICY
-- =============================================================================

-- Drop the old policy that restricted viewing to owned projects
DROP POLICY IF EXISTS "Users can view own non-deleted projects" ON public.projects;

-- Create new policy that allows all users to view all projects
CREATE POLICY "Users can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
);

-- Comment
COMMENT ON POLICY "Users can view all non-deleted projects" ON public.projects IS
'Minden authenticated user láthatja az összes nem törölt projektet';

-- =============================================================================
-- 2. DRAWINGS TABLE - UPDATE SELECT POLICY
-- =============================================================================

-- Drop the old policy that restricted viewing to owned project drawings
DROP POLICY IF EXISTS drawings_select_policy ON public.drawings;

-- Create new policy that allows all users to view all drawings
CREATE POLICY drawings_select_policy
ON public.drawings
FOR SELECT
USING (
  -- Feltétel 1: Minden authenticated user látja az aktív rajzokat
  (
    deleted_at IS NULL
  )
  OR
  -- Feltétel 2: Admin mindent lát (törölt rajzokat is)
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
);

-- Comment
COMMENT ON POLICY drawings_select_policy ON public.drawings IS
'Minden user látja az összes aktív rajzot, Admin mindent (törölt rajzokkal együtt)';

-- =============================================================================
-- 3. FORM RESPONSES TABLE - UPDATE SELECT POLICY
-- =============================================================================

-- Drop the old policy that restricted viewing to owned project form responses
DROP POLICY IF EXISTS "Project owners can view own form responses" ON public.project_form_responses;

-- Create new policy that allows all users to view all form responses
CREATE POLICY "All users can view form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.deleted_at IS NULL
  )
);

-- Comment
COMMENT ON POLICY "All users can view form responses" ON public.project_form_responses IS
'Minden user láthatja az összes űrlap választ (aktív projektekhez tartozók)';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Test 1: Check all policies on projects table
-- SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test 2: Check all policies on drawings table
-- SELECT * FROM pg_policies WHERE tablename = 'drawings';

-- Test 3: Check all policies on project_form_responses table
-- SELECT * FROM pg_policies WHERE tablename = 'project_form_responses';

-- =============================================================================
-- NOTES
-- =============================================================================

-- The following operations are STILL RESTRICTED to project owners:
-- - Creating new projects (INSERT)
-- - Updating project details (UPDATE)
-- - Deleting projects (soft delete via UPDATE)
-- - Creating drawings in projects (INSERT)
-- - Updating drawings (UPDATE)
-- - Creating form responses (INSERT)
-- - Updating form responses (UPDATE)

-- Only SELECT operations have been opened up to all authenticated users.

-- =============================================================================
-- END OF UPDATE SCRIPT
-- =============================================================================
