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

-- Policy: Viewer láthatja az összes nem törölt projektet
CREATE POLICY "Viewers can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  AND deleted_at IS NULL
);

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
-- 8. PROJECT_FORM_RESPONSES TÁBLA - RLS POLICIES
-- =============================================================================

-- Policy: Admin megtekintheti az összes űrlap választ
CREATE POLICY "Admins can view any project form response"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Projekt tulajdonos megtekintheti a saját űrlap válaszait
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

-- Policy: Viewer megtekintheti az összes űrlap választ
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

-- Policy: Admin létrehozhat új űrlap választ
CREATE POLICY "Admins can insert project form responses"
ON public.project_form_responses
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Projekt tulajdonos létrehozhat saját űrlap választ
CREATE POLICY "Project owners can insert project form responses"
ON public.project_form_responses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.owner_id = auth.uid()
      AND public.projects.deleted_at IS NULL
  )
);

-- Policy: Admin frissítheti az űrlap válaszokat
CREATE POLICY "Admins can update any project form response"
ON public.project_form_responses
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Projekt tulajdonos frissítheti saját űrlap válaszait
CREATE POLICY "Project owners can update own form responses"
ON public.project_form_responses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.owner_id = auth.uid()
      AND public.projects.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.owner_id = auth.uid()
      AND public.projects.deleted_at IS NULL
  )
);

-- Megjegyzés:  Űrlap válaszokat nem törlünk (audit cél), ezért nincs DELETE policy

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

-- PROJECT_FORM_RESPONSES tábla:
-- 1. Admins can view any project form response (SELECT)
-- 2. Project owners can view own form responses (SELECT)
-- 3. Admins can insert project form responses (INSERT)
-- 4. Project owners can insert project form responses (INSERT)
-- 5. Admins can update any project form response (UPDATE)
-- 6. Project owners can update own form responses (UPDATE)

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
-- =============================================================================-- =============================================================================
-- Drawing Module - Row Level Security Policies
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-30
-- Készítette: Backend Engineer
-- Modul: Felmérés Rajzoló (Survey Drawing Module)
-- =============================================================================

-- Megjegyzés: Ez a script tartalmazza a drawings tábla RLS policy-jait
-- Roles: admin (mindent lát és szerkeszt), user (csak sajátját), viewer (csak néz)

-- =============================================================================
-- RLS POLICY STRATÉGIA
-- =============================================================================

-- SELECT Policy:
-- - User látja saját projektjeihez tartozó rajzokat (deleted_at IS NULL)
-- - Admin mindent lát (törölt rajzokat is)
-- - Viewer látja a neki megosztott projektek rajzait (future scope)

-- INSERT Policy:
-- - User és Admin hozhat létre rajzot
-- - Csak olyan projekthez, amelyhez van jogosultsága (owner vagy admin)

-- UPDATE Policy:
-- - User csak saját projektjeinek rajzait szerkesztheti
-- - Admin mindent szerkeszthet

-- DELETE Policy:
-- - User csak saját projektjeinek rajzait törölheti (soft delete = UPDATE deleted_at)
-- - Admin mindent törölhet

-- =============================================================================
-- 1. SELECT POLICY - RAJZOK LEKÉRDEZÉSE
-- =============================================================================

-- Policy név: drawings_select_policy
-- Célja: User látja saját projekt rajzait, Viewer és Admin mindent
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

-- Komment hozzáadása
COMMENT ON POLICY drawings_select_policy ON public.drawings IS
'SELECT policy: User látja saját projektjeihez tartozó aktív rajzokat, Viewer látja az összes aktív rajzot, Admin mindent (törölt rajzokkal együtt)';

-- =============================================================================
-- 2. INSERT POLICY - RAJZ LÉTREHOZÁSA
-- =============================================================================

-- Policy név: drawings_insert_policy
-- Célja: User és Admin hozhat létre rajzot, csak saját/jogosult projekthez
DROP POLICY IF EXISTS drawings_insert_policy ON public.drawings;
CREATE POLICY drawings_insert_policy
ON public.drawings
FOR INSERT
WITH CHECK (
  -- Feltétel 1: User vagy Admin role szükséges
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role IN ('admin', 'user')
    )
  )
  AND
  -- Feltétel 2: Csak olyan projekthez, amelyhez van jogosultság
  (
    -- User csak saját projektjéhez hozhat létre rajzot
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.drawings.project_id
        AND public.projects.owner_id = auth.uid()
    )
    OR
    -- Admin bármelyik projekthez létrehozhat rajzot
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
  AND
  -- Feltétel 3: created_by mező meg kell egyezzen a bejelentkezett user-rel
  (
    public.drawings.created_by = auth.uid()
  )
);

-- Komment hozzáadása
COMMENT ON POLICY drawings_insert_policy ON public.drawings IS
'INSERT policy: User és Admin hozhat létre rajzot, csak saját/jogosult projekthez, created_by kötelezően auth.uid()';

-- =============================================================================
-- 3. UPDATE POLICY - RAJZ SZERKESZTÉSE
-- =============================================================================

-- Policy név: drawings_update_policy
-- Célja: User csak saját projektjeihez tartozó rajzokat szerkesztheti, Admin mindent
DROP POLICY IF EXISTS drawings_update_policy ON public.drawings;
CREATE POLICY drawings_update_policy
ON public.drawings
FOR UPDATE
USING (
  -- Feltétel 1: User csak saját projektjeihez tartozó rajzokat szerkesztheti
  (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.drawings.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  -- Feltétel 2: Admin mindent szerkeszthet
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
)
WITH CHECK (
  -- WITH CHECK: Ugyanaz mint USING (megakadályozza a project_id módosítását másik projektre)
  (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.drawings.project_id
        AND public.projects.owner_id = auth.uid()
    )
  )
  OR
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
);

-- Komment hozzáadása
COMMENT ON POLICY drawings_update_policy ON public.drawings IS
'UPDATE policy: User csak saját projektjeihez tartozó rajzokat szerkesztheti, Admin mindent. Megakadályozza a project_id módosítását másik user projektjére';

-- =============================================================================
-- 4. DELETE POLICY - RAJZ TÖRLÉSE (SOFT DELETE)
-- =============================================================================

-- Megjegyzés: Mivel soft delete-et használunk (UPDATE deleted_at),
-- nincs szükség külön DELETE policy-re, mert az UPDATE policy kezeli.

-- Ha mégis lenne hard delete (ritkán használt), itt van egy példa policy:
-- DROP POLICY IF EXISTS drawings_delete_policy ON public.drawings;
-- CREATE POLICY drawings_delete_policy
-- ON public.drawings
-- FOR DELETE
-- USING (
--   -- User csak saját projektjeihez tartozó rajzokat törölheti
--   (
--     EXISTS (
--       SELECT 1
--       FROM public.projects
--       WHERE public.projects.id = public.drawings.project_id
--         AND public.projects.owner_id = auth.uid()
--     )
--   )
--   OR
--   -- Admin mindent törölhet
--   (
--     EXISTS (
--       SELECT 1
--       FROM public.profiles
--       WHERE public.profiles.id = auth.uid()
--         AND public.profiles.role = 'admin'
--     )
--   )
-- );

-- =============================================================================
-- VIEWER ROLE POLICY (FUTURE SCOPE)
-- =============================================================================

-- Viewer role jelenleg nincs implementálva a drawings modul MVP-ben
-- Future scope: Viewer láthat rajzokat, de nem szerkesztheti őket

-- SELECT policy már támogatja a viewer role-t (ha projekt owner megosztja)
-- INSERT/UPDATE policy-kben a viewer nincs engedélyezve (csak olvasás)

-- =============================================================================
-- POLICY TESZTELÉS
-- =============================================================================

-- Test Case 1: User létrehoz egy rajzot saját projektjében
-- PASS: drawings_insert_policy engedélyezi

-- Test Case 2: User megpróbál rajzot létrehozni más user projektjében
-- FAIL: drawings_insert_policy megakadályozza (nincs owner jogosultság)

-- Test Case 3: Admin létrehoz rajzot bármelyik projektben
-- PASS: drawings_insert_policy engedélyezi (admin role)

-- Test Case 4: User lekérdezi saját projektjeihez tartozó rajzokat
-- PASS: drawings_select_policy visszaadja az aktív rajzokat

-- Test Case 5: User lekérdezi más user projekt rajzait
-- FAIL: drawings_select_policy nem adja vissza (nincs owner jogosultság)

-- Test Case 6: Admin lekérdezi az összes rajzot
-- PASS: drawings_select_policy visszaadja az összes rajzot (töröltekkel együtt)

-- Test Case 7: User frissíti saját projekt rajzát (canvas_data, name)
-- PASS: drawings_update_policy engedélyezi

-- Test Case 8: User soft delete-eli saját projekt rajzát (deleted_at = NOW())
-- PASS: drawings_update_policy engedélyezi (soft delete = UPDATE)

-- Test Case 9: User megpróbálja más user projekt rajzát szerkeszteni
-- FAIL: drawings_update_policy megakadályozza

-- Test Case 10: User megpróbálja a project_id-t módosítani más user projektjére
-- FAIL: drawings_update_policy WITH CHECK megakadályozza

-- =============================================================================
-- RLS POLICY TELJESÍTMÉNY OPTIMALIZÁCIÓ
-- =============================================================================

-- Az RLS policy-k EXISTS subquery-ket használnak, amelyek hatékonyan
-- kihasználják a meglévő index-eket:
-- 1. idx_projects_owner_id (projects.owner_id)
-- 2. idx_drawings_project_id (drawings.project_id)
-- 3. idx_profiles_role (profiles.role)

-- Query plan ellenőrzése:
-- EXPLAIN ANALYZE SELECT * FROM drawings WHERE project_id = 'uuid-here';

-- =============================================================================
-- ÖSSZEFOGLALÓ
-- =============================================================================

-- Létrehozott RLS Policy-k:
-- 1. drawings_select_policy (SELECT)
--    - User: saját projekt aktív rajzai
--    - Admin: minden rajz (töröltekkel együtt)
--
-- 2. drawings_insert_policy (INSERT)
--    - User: rajz létrehozása saját projekthez
--    - Admin: rajz létrehozása bármelyik projekthez
--    - Ellenőrzés: created_by = auth.uid()
--
-- 3. drawings_update_policy (UPDATE)
--    - User: saját projekt rajzainak szerkesztése
--    - Admin: minden rajz szerkesztése
--    - Védelem: megakadályozza project_id módosítását másik user projektjére
--
-- 4. drawings_delete_policy (DELETE)
--    - Nincs implementálva (soft delete = UPDATE)

-- Role-ok:
-- - admin: teljes hozzáférés (minden projektet lát és szerkeszt)
-- - user: csak saját projektjeihez tartozó rajzokat látja és szerkeszti
-- - viewer: future scope (csak olvasás, nincs szerkesztés)

-- =============================================================================
-- END OF DRAWINGS POLICIES
-- =============================================================================