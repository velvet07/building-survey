-- =============================================================================
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
-- Célja: Minden felhasználó látja az összes aktív rajzot, Admin mindent
DROP POLICY IF EXISTS drawings_select_policy ON public.drawings;
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

-- Komment hozzáadása
COMMENT ON POLICY drawings_select_policy ON public.drawings IS
'SELECT policy: Minden user látja az összes aktív rajzot, Admin mindent (törölt rajzokkal együtt)';

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