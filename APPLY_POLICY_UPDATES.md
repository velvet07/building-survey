-- =============================================================================
-- Update RLS Policies to Allow Viewer Role to View All Projects
-- =============================================================================
-- Purpose: Update RLS policies so that VIEWER users can view all projects,
--          drawings, and form responses (not just their own).
--          USER role still only sees their own projects.
--          ADMIN role still sees everything and can edit.
-- Date: 2025-10-25
-- =============================================================================

-- =============================================================================
-- 1. PROJECTS TABLE - ADD VIEWER SELECT POLICY
-- =============================================================================

-- Drop the old "all users" policy if it exists (from incorrect implementation)
DROP POLICY IF EXISTS "Users can view all non-deleted projects" ON public.projects;

-- Ensure the correct user policy exists
DROP POLICY IF EXISTS "Users can view own non-deleted projects" ON public.projects;
CREATE POLICY "Users can view own non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
);

-- Create new policy for viewer to see all projects
DROP POLICY IF EXISTS "Viewers can view all non-deleted projects" ON public.projects;
CREATE POLICY "Viewers can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  AND deleted_at IS NULL
);

-- Comment
COMMENT ON POLICY "Users can view own non-deleted projects" ON public.projects IS
'User láthatja saját nem törölt projektjeit';

COMMENT ON POLICY "Viewers can view all non-deleted projects" ON public.projects IS
'Viewer láthatja az összes nem törölt projektet';

-- =============================================================================
-- 2. DRAWINGS TABLE - ADD VIEWER SELECT POLICY
-- =============================================================================

-- Drop and recreate the drawings select policy with viewer support
DROP POLICY IF EXISTS drawings_select_policy ON public.drawings;

CREATE POLICY drawings_select_policy
ON public.drawings
FOR SELECT
USING (
  -- Feltétel 1: User látja saját projektjeihez tartozó aktív rajzokat
  (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.drawings.project_id
        AND public.projects.owner_id = auth.uid()
        AND public.drawings.deleted_at IS NULL
    )
  )
  OR
  -- Feltétel 2: Viewer látja az összes aktív rajzot
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
    AND deleted_at IS NULL
  )
  OR
  -- Feltétel 3: Admin mindent lát (törölt rajzokat is)
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
'User látja saját projektjeihez tartozó aktív rajzokat, Viewer látja az összes aktív rajzot, Admin mindent';

-- =============================================================================
-- 3. FORM RESPONSES TABLE - ADD VIEWER SELECT POLICY
-- =============================================================================

-- Drop the old "all users" policy if it exists (from incorrect implementation)
DROP POLICY IF EXISTS "All users can view form responses" ON public.project_form_responses;

-- Ensure the correct user policy exists
DROP POLICY IF EXISTS "Project owners can view own form responses" ON public.project_form_responses;
CREATE POLICY "Project owners can view own form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.owner_id = auth.uid()
      AND public.projects.deleted_at IS NULL
  )
);

-- Create new policy for viewer to see all form responses
DROP POLICY IF EXISTS "Viewers can view all form responses" ON public.project_form_responses;
CREATE POLICY "Viewers can view all form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  AND EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.deleted_at IS NULL
  )
);

-- Comment
COMMENT ON POLICY "Project owners can view own form responses" ON public.project_form_responses IS
'Projekt tulajdonos megtekintheti a saját űrlap válaszait';

COMMENT ON POLICY "Viewers can view all form responses" ON public.project_form_responses IS
'Viewer megtekintheti az összes űrlap választ (aktív projektekhez tartozók)';

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

-- Role-based access after this update:
--
-- VIEWER:
-- - Can VIEW all projects (not just their own)
-- - Can VIEW all drawings (not just from their projects)
-- - Can VIEW all form responses (not just from their projects)
-- - CANNOT create, update, or delete anything
--
-- USER:
-- - Can VIEW only their own projects
-- - Can VIEW only drawings from their own projects
-- - Can VIEW only form responses from their own projects
-- - Can CREATE, UPDATE, DELETE their own projects/drawings/forms
--
-- ADMIN:
-- - Can VIEW everything (including deleted items)
-- - Can CREATE, UPDATE, DELETE everything
--
-- The following operations are STILL RESTRICTED to project owners:
-- - Creating new projects (INSERT) - only admin and user
-- - Updating project details (UPDATE) - only owner and admin
-- - Deleting projects (soft delete via UPDATE) - only owner and admin
-- - Creating drawings in projects (INSERT) - only admin and user
-- - Updating drawings (UPDATE) - only owner and admin
-- - Creating form responses (INSERT) - only project owner and admin
-- - Updating form responses (UPDATE) - only project owner and admin

-- =============================================================================
-- END OF UPDATE SCRIPT
-- =============================================================================

## Alkalmazás lépései

### 1. Nyisd meg a Supabase Dashboard-ot
- Menj a projekted Supabase Dashboard-jára
- Kattints a bal oldali menüben a **SQL Editor**-ra

### 2. Futtasd le az SQL scriptet
- Kattints a **New Query** gombra
- Másold be a fenti SQL kódot
- Kattints a **Run** gombra (vagy nyomj `Ctrl+Enter` / `Cmd+Enter`)
- Várd meg, amíg a script lefut
- Ellenőrizd, hogy nincs-e hiba üzenet

### 3. Sikeres alkalmazás után
Miután lefuttattad a scriptet:
1. Jelentkezz ki és vissza viewer user-rel
2. Ellenőrizd, hogy látod-e az összes projektet
3. Próbáld meg szerkeszteni egy projektet - ez nem fog menni (csak megtekintés)
4. A user user-ek továbbra is csak a saját projektjeiket látják

## Megjegyzés
Ez a frissítés a production adatbázist módosítja. A változtatások azonnal életbe lépnek minden felhasználónál.
