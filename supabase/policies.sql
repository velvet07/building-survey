-- =============================================================================
-- Moduláris WebApp MVP - Row Level Security Policies
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-29
-- Készítette: System Architect
-- =============================================================================

-- Ez a fájl tartalmazza az összes RLS policy definíciót
-- Minden táblához külön policy-k kerülnek beállításra

-- =============================================================================
-- 1. PROFILES TÁBLA - RLS POLICIES
-- =============================================================================

-- Policy: User láthatja saját profil adatait
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: User frissítheti saját profil adatait (email, de NEM role)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Role NEM változtatható (security)
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Policy: Admin láthatja minden user profil adatait
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admin frissítheti bármely user profil adatait (beleértve role-t is)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- =============================================================================
-- 2. PROJECTS TÁBLA - SELECT POLICIES
-- =============================================================================

-- Policy: Admin láthatja az összes nem törölt projektet
CREATE POLICY "Admins can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  AND deleted_at IS NULL
);

-- Policy: User láthatja saját nem törölt projektjeit
CREATE POLICY "Users can view own non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
);

-- Policy: Viewer később láthatja a megosztott projekteket (MVP-ben nincs implementálva)
-- Placeholder - későbbi feature-höz
-- CREATE POLICY "Viewers can view shared projects"
-- ON public.projects
-- FOR SELECT
-- TO authenticated
-- USING (
--   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
--   AND deleted_at IS NULL
--   AND id IN (SELECT project_id FROM public.project_shares WHERE user_id = auth.uid())
-- );

-- =============================================================================
-- 3. PROJECTS TÁBLA - INSERT POLICIES
-- =============================================================================

-- Policy: Admin és User létrehozhatnak új projektet
CREATE POLICY "Admins and Users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'user')
  AND owner_id = auth.uid()
);

-- Policy: Viewer NEM hozhat létre projektet (nincs policy)
-- Az INSERT policy hiánya automatikusan tiltja a viewer-ek számára

-- =============================================================================
-- 4. PROJECTS TÁBLA - UPDATE POLICIES
-- =============================================================================

-- Policy: Admin frissíthet bármely nem törölt projektet
CREATE POLICY "Admins can update any non-deleted project"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  AND deleted_at IS NULL
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  AND deleted_at IS NULL
);

-- Policy: User frissítheti saját nem törölt projektjeit
CREATE POLICY "Users can update own non-deleted projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
)
WITH CHECK (
  owner_id = auth.uid()
  AND deleted_at IS NULL
);

-- Policy: Viewer NEM frissíthet projekteket (nincs policy)

-- =============================================================================
-- 5. PROJECTS TÁBLA - DELETE POLICIES (Soft Delete)
-- =============================================================================

-- Megjegyzés: A "DELETE" valójában UPDATE művelet a deleted_at oszlopon
-- Ezért az UPDATE policy-k kezelik a soft delete-et is

-- Policy: Admin "törölhet" (soft delete) bármely projektet
CREATE POLICY "Admins can soft delete any project"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: User "törölhet" (soft delete) saját projektjeit
CREATE POLICY "Users can soft delete own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Viewer NEM törölhet projekteket (nincs policy)

-- =============================================================================
-- 6. MODULES TÁBLA - RLS POLICIES
-- =============================================================================

-- Policy: Minden authenticated user láthatja a modulok listáját
CREATE POLICY "Everyone can view modules"
ON public.modules
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admin létrehozhat új modulokat
CREATE POLICY "Admins can create modules"
ON public.modules
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admin frissítheti a modulokat
CREATE POLICY "Admins can update modules"
ON public.modules
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admin törölhet modulokat (csak non-system modulokat)
CREATE POLICY "Admins can delete non-system modules"
ON public.modules
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  AND is_system = FALSE
);

-- =============================================================================
-- 7. USER_MODULE_ACTIVATIONS TÁBLA - RLS POLICIES
-- =============================================================================

-- Policy: User láthatja saját modul aktivációit
CREATE POLICY "Users can view own module activations"
ON public.user_module_activations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admin láthatja minden user modul aktivációit
CREATE POLICY "Admins can view all module activations"
ON public.user_module_activations
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admin és User aktiválhatnak modulokat saját fiókjukhoz
CREATE POLICY "Admins and Users can activate modules for themselves"
ON public.user_module_activations
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'user')
  AND user_id = auth.uid()
);

-- Policy: Admin aktiválhat modulokat más userek fiókjához
CREATE POLICY "Admins can activate modules for any user"
ON public.user_module_activations
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: User deaktiválhat modulokat saját fiókjáról
CREATE POLICY "Users can deactivate own modules"
ON public.user_module_activations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admin deaktiválhat modulokat bármely user fiókjáról
CREATE POLICY "Admins can deactivate modules for any user"
ON public.user_module_activations
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Viewer NEM aktiválhat/deaktiválhat modulokat (nincs policy)

-- =============================================================================
-- RLS POLICIES SUMMARY
-- =============================================================================

-- PROFILES tábla:
-- 1. Users can view own profile (SELECT)
-- 2. Users can update own profile (UPDATE - NO role change)
-- 3. Admins can view all profiles (SELECT)
-- 4. Admins can update any profile (UPDATE - including role)

-- PROJECTS tábla:
-- SELECT:
-- 1. Admins can view all non-deleted projects
-- 2. Users can view own non-deleted projects
-- 3. Viewers - későbbi feature (megosztott projektek)

-- INSERT:
-- 1. Admins and Users can create projects
-- 2. Viewers - NINCS (tiltott)

-- UPDATE:
-- 1. Admins can update any non-deleted project
-- 2. Users can update own non-deleted projects
-- 3. Admins can soft delete any project
-- 4. Users can soft delete own projects
-- 5. Viewers - NINCS (tiltott)

-- MODULES tábla:
-- 1. Everyone can view modules (SELECT)
-- 2. Admins can create modules (INSERT)
-- 3. Admins can update modules (UPDATE)
-- 4. Admins can delete non-system modules (DELETE)

-- USER_MODULE_ACTIVATIONS tábla:
-- 1. Users can view own module activations (SELECT)
-- 2. Admins can view all module activations (SELECT)
-- 3. Admins and Users can activate modules for themselves (INSERT)
-- 4. Admins can activate modules for any user (INSERT)
-- 5. Users can deactivate own modules (DELETE)
-- 6. Admins can deactivate modules for any user (DELETE)

-- =============================================================================
-- TESTING COMMANDS (Manual Testing)
-- =============================================================================

-- Test 1: Admin látja az összes projektet
-- Login as admin user
-- SELECT * FROM public.projects WHERE deleted_at IS NULL;

-- Test 2: User csak saját projektjeit látja
-- Login as regular user
-- SELECT * FROM public.projects WHERE deleted_at IS NULL;

-- Test 3: User megpróbál más user projektjét szerkeszteni
-- Login as user1
-- UPDATE public.projects SET name = 'Hacked' WHERE owner_id != auth.uid();
-- Expected: 0 rows affected (RLS policy tiltja)

-- Test 4: Viewer megpróbál projektet létrehozni
-- Login as viewer user
-- INSERT INTO public.projects (name, owner_id) VALUES ('Test', auth.uid());
-- Expected: Permission denied (RLS policy tiltja)

-- Test 5: Admin módosítja más user role-ját
-- Login as admin
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- Expected: Success

-- Test 6: User megpróbálja módosítani saját role-ját
-- Login as user
-- UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
-- Expected: Permission denied (RLS policy tiltja)

-- =============================================================================
-- END OF POLICIES
-- =============================================================================