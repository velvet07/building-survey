-- =============================================================================
-- Moduláris WebApp MVP - Database Functions
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-29
-- Készítette: System Architect
-- =============================================================================

-- Ez a fájl tartalmazza az auto identifier generation logikát
-- és egyéb utility function-öket

-- =============================================================================
-- 1. AUTO IDENTIFIER GENERATION FUNCTION
-- =============================================================================

-- Function: Automatikusan generálja a projekt azonosítót
-- Formátum: PROJ-YYYYMMDD-NNN
-- Példa: PROJ-20250929-001, PROJ-20250929-002

CREATE OR REPLACE FUNCTION generate_project_identifier()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  today_count INTEGER;
  new_identifier TEXT;
BEGIN
  -- Mai dátum formázása YYYYMMDD formátumban
  today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Mai projektek számának lekérdezése
  -- Csak azokat a projekteket számoljuk, amelyek ma lettek létrehozva
  SELECT COUNT(*)
  INTO today_count
  FROM public.projects
  WHERE auto_identifier LIKE 'PROJ-' || today_date || '-%';

  -- Következő szekvenciális szám (001, 002, ...)
  today_count := today_count + 1;

  -- Új identifier generálása
  -- LPAD: balról feltöltés nullákkal 3 jegyűre (001, 002, 010, 100)
  new_identifier := 'PROJ-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0');

  RETURN new_identifier;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION generate_project_identifier() IS 'Automatikusan generál egy egyedi projekt azonosítót PROJ-YYYYMMDD-NNN formátumban';

-- =============================================================================
-- 2. AUTO IDENTIFIER TRIGGER
-- =============================================================================

-- Function: Trigger function amely beállítja az auto_identifier-t INSERT előtt
CREATE OR REPLACE FUNCTION set_project_auto_identifier()
RETURNS TRIGGER AS $$
BEGIN
  -- Ha az auto_identifier nincs beállítva, generáljuk
  IF NEW.auto_identifier IS NULL OR NEW.auto_identifier = '' THEN
    NEW.auto_identifier := generate_project_identifier();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger létrehozása a projects táblához
DROP TRIGGER IF EXISTS trigger_set_project_auto_identifier ON public.projects;
CREATE TRIGGER trigger_set_project_auto_identifier
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION set_project_auto_identifier();

-- Komment hozzáadása
COMMENT ON FUNCTION set_project_auto_identifier() IS 'Trigger function amely automatikusan beállítja a projekt auto_identifier értékét INSERT előtt';

-- =============================================================================
-- 3. GET USER ROLE HELPER FUNCTION
-- =============================================================================

-- Function: Lekérdezi az aktuális bejelentkezett user role-ját
-- Használat: SELECT get_current_user_role();
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role
  INTO user_role_value
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION get_current_user_role() IS 'Lekérdezi az aktuális bejelentkezett user role-ját (admin, user, viewer)';

-- =============================================================================
-- 4. CHECK IF USER IS ADMIN
-- =============================================================================

-- Function: Ellenőrzi, hogy az aktuális user admin-e
-- Használat: SELECT is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION is_admin() IS 'Ellenőrzi, hogy az aktuális bejelentkezett user admin szerepkörrel rendelkezik-e';

-- =============================================================================
-- 5. SOFT DELETE HELPER FUNCTION
-- =============================================================================

-- Function: Soft delete végrehajtása egy projekten
-- Használat: SELECT soft_delete_project('project-uuid');
CREATE OR REPLACE FUNCTION soft_delete_project(project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.projects
  SET deleted_at = NOW()
  WHERE id = project_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION soft_delete_project(UUID) IS 'Soft delete végrehajtása egy projekten (beállítja a deleted_at timestamp-et)';

-- =============================================================================
-- 6. RESTORE SOFT DELETED PROJECT
-- =============================================================================

-- Function: Visszaállít egy soft deleted projektet
-- Használat: SELECT restore_project('project-uuid');
CREATE OR REPLACE FUNCTION restore_project(project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.projects
  SET deleted_at = NULL
  WHERE id = project_id
    AND deleted_at IS NOT NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION restore_project(UUID) IS 'Visszaállít egy soft deleted projektet (NULL-ra állítja a deleted_at értékét)';

-- =============================================================================
-- 7. GET ACTIVE MODULES FOR USER
-- =============================================================================

-- Function: Lekérdezi a user számára aktivált modulokat
-- Használat: SELECT * FROM get_user_active_modules();
CREATE OR REPLACE FUNCTION get_user_active_modules()
RETURNS TABLE (
  module_id UUID,
  module_name TEXT,
  module_slug TEXT,
  module_description TEXT,
  activated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS module_id,
    m.name AS module_name,
    m.slug AS module_slug,
    m.description AS module_description,
    uma.activated_at
  FROM public.modules m
  INNER JOIN public.user_module_activations uma ON m.id = uma.module_id
  WHERE uma.user_id = auth.uid()
  ORDER BY uma.activated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION get_user_active_modules() IS 'Lekérdezi az aktuális user számára aktivált modulok listáját';

-- =============================================================================
-- 8. ACTIVATE MODULE FOR USER
-- =============================================================================

-- Function: Aktivál egy modult egy user számára
-- Használat: SELECT activate_module_for_user('module-uuid');
CREATE OR REPLACE FUNCTION activate_module_for_user(p_module_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_module_activations (user_id, module_id)
  VALUES (auth.uid(), p_module_id)
  ON CONFLICT (user_id, module_id) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION activate_module_for_user(UUID) IS 'Aktivál egy modult az aktuális user számára';

-- =============================================================================
-- 9. DEACTIVATE MODULE FOR USER
-- =============================================================================

-- Function: Deaktiválja egy modult egy user számára
-- Használat: SELECT deactivate_module_for_user('module-uuid');
CREATE OR REPLACE FUNCTION deactivate_module_for_user(p_module_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  DELETE FROM public.user_module_activations
  WHERE user_id = auth.uid()
    AND module_id = p_module_id;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION deactivate_module_for_user(UUID) IS 'Deaktiválja egy modult az aktuális user számára';

-- =============================================================================
-- 10. GET PROJECT STATISTICS
-- =============================================================================

-- Function: Statisztikák lekérdezése a projektekről
-- Használat: SELECT * FROM get_project_statistics();
CREATE OR REPLACE FUNCTION get_project_statistics()
RETURNS TABLE (
  total_projects BIGINT,
  active_projects BIGINT,
  deleted_projects BIGINT,
  projects_created_today BIGINT,
  projects_created_this_week BIGINT,
  projects_created_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_projects,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active_projects,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_projects,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND deleted_at IS NULL) AS projects_created_today,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) AND deleted_at IS NULL) AS projects_created_this_week,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND deleted_at IS NULL) AS projects_created_this_month
  FROM public.projects
  WHERE (
    -- Admin látja az összes projektet
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- User csak a sajátját
    owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komment hozzáadása
COMMENT ON FUNCTION get_project_statistics() IS 'Statisztikák lekérdezése a projektekről (role-based)';

-- =============================================================================
-- FUNCTIONS SUMMARY
-- =============================================================================

-- Létrehozott function-ök:
-- 1. generate_project_identifier() - Auto ID generálás
-- 2. set_project_auto_identifier() - Trigger function auto ID-hez
-- 3. get_current_user_role() - User role lekérdezés
-- 4. is_admin() - Admin ellenőrzés
-- 5. soft_delete_project(UUID) - Soft delete
-- 6. restore_project(UUID) - Soft delete visszavonás
-- 7. get_user_active_modules() - User modulok lekérdezése
-- 8. activate_module_for_user(UUID) - Modul aktiválás
-- 9. deactivate_module_for_user(UUID) - Modul deaktiválás
-- 10. get_project_statistics() - Projekt statisztikák

-- Trigger-ek:
-- 1. trigger_set_project_auto_identifier - Auto ID trigger

-- =============================================================================
-- TESTING COMMANDS (Manual Testing)
-- =============================================================================

-- Test 1: Auto identifier generálás
-- SELECT generate_project_identifier();

-- Test 2: User role lekérdezés
-- SELECT get_current_user_role();

-- Test 3: Admin ellenőrzés
-- SELECT is_admin();

-- Test 4: Project soft delete
-- SELECT soft_delete_project('uuid-here');

-- Test 5: User aktív modulok
-- SELECT * FROM get_user_active_modules();

-- Test 6: Projekt statisztikák
-- SELECT * FROM get_project_statistics();

-- =============================================================================
-- END OF FUNCTIONS
-- =============================================================================