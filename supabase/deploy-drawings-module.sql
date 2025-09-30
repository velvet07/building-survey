-- =============================================================================
-- Drawing Module - Deployment Script
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-30
-- Készítette: Backend Engineer
-- =============================================================================

-- Ez a script telepíti a teljes Drawing Module backend részét
-- Sorrendiség fontos! A script-ek egymás után futnak le

-- HASZNÁLAT:
-- 1. Supabase SQL Editor-ben futtasd le ezt a script-et
-- 2. Vagy használd a Supabase CLI-t:
--    supabase db push

-- =============================================================================
-- DEPLOYMENT STEPS
-- =============================================================================

-- STEP 1: Schema létrehozása (enum-ok, tábla, index-ek, constraint-ek, trigger-ek)
\echo 'STEP 1: Creating drawings schema...'
\i schema_drawings.sql

-- STEP 2: Functions létrehozása (auto-naming, helper functions)
\echo 'STEP 2: Creating drawings functions...'
\i functions_drawings.sql

-- STEP 3: RLS Policies létrehozása
\echo 'STEP 3: Creating drawings RLS policies...'
\i policies_drawings.sql

-- STEP 4: Test data seed (opcionális - csak development környezetben)
\echo 'STEP 4: Seeding test data...'
-- Kommenteld ki production környezetben!
\i seed_drawings.sql

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Ellenőrzések futtatása a telepítés után
DO $$
DECLARE
  table_exists BOOLEAN;
  enum_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'DRAWING MODULE DEPLOYMENT VERIFICATION';
  RAISE NOTICE '=============================================================================';

  -- 1. Tábla létezik?
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'drawings'
  ) INTO table_exists;
  RAISE NOTICE '✓ Drawings table exists: %', table_exists;

  -- 2. Enum típusok léteznek?
  SELECT COUNT(*) INTO enum_count
  FROM pg_type
  WHERE typname IN ('paper_size_enum', 'paper_orientation_enum');
  RAISE NOTICE '✓ Enum types created: % (expected: 2)', enum_count;

  -- 3. Index-ek léteznek?
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'drawings';
  RAISE NOTICE '✓ Indexes created: % (expected: 5)', index_count;

  -- 4. RLS policies léteznek?
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'drawings';
  RAISE NOTICE '✓ RLS policies created: % (expected: 3)', policy_count;

  -- 5. Functions léteznek?
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN (
    'generate_drawing_name',
    'set_default_drawing_name',
    'get_project_drawing_count',
    'soft_delete_drawing',
    'restore_drawing',
    'get_project_drawings',
    'get_drawing_statistics',
    'duplicate_drawing'
  );
  RAISE NOTICE '✓ Functions created: % (expected: 8)', function_count;

  -- 6. Trigger-ek léteznek?
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname IN ('auto_name_drawing', 'update_drawings_updated_at');
  RAISE NOTICE '✓ Triggers created: % (expected: 2)', trigger_count;

  RAISE NOTICE '=============================================================================';

  -- Összesített ellenőrzés
  IF table_exists AND enum_count = 2 AND index_count = 5 AND policy_count = 3 AND function_count = 8 AND trigger_count = 2 THEN
    RAISE NOTICE '✅ DEPLOYMENT SUCCESSFUL - All components created successfully!';
  ELSE
    RAISE WARNING '⚠️  DEPLOYMENT INCOMPLETE - Some components are missing!';
  END IF;

  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- POST-DEPLOYMENT INSTRUCTIONS
-- =============================================================================

-- 1. RLS Policy tesztelés:
--    - Jelentkezz be user-ként és próbálj rajzot létrehozni
--    - Jelentkezz be admin-ként és nézd meg az összes rajzot

-- 2. Function tesztelés:
--    SELECT generate_drawing_name((SELECT id FROM projects LIMIT 1));

-- 3. Trigger tesztelés:
--    INSERT INTO drawings (project_id, created_by)
--    VALUES (
--      (SELECT id FROM projects LIMIT 1),
--      (SELECT id FROM auth.users LIMIT 1)
--    );

-- 4. Query performance tesztelés:
--    EXPLAIN ANALYZE SELECT * FROM drawings WHERE project_id = 'uuid-here';

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =============================================================================

-- Ha vissza kell állítani a telepítést:
-- 1. DROP TABLE public.drawings CASCADE;
-- 2. DROP TYPE paper_size_enum CASCADE;
-- 3. DROP TYPE paper_orientation_enum CASCADE;
-- 4. DROP FUNCTION generate_drawing_name(UUID) CASCADE;
-- 5. DROP FUNCTION set_default_drawing_name() CASCADE;
-- 6. DROP FUNCTION get_project_drawing_count(UUID) CASCADE;
-- 7. DROP FUNCTION soft_delete_drawing(UUID) CASCADE;
-- 8. DROP FUNCTION restore_drawing(UUID) CASCADE;
-- 9. DROP FUNCTION get_project_drawings(UUID, INTEGER, INTEGER) CASCADE;
-- 10. DROP FUNCTION get_drawing_statistics(UUID) CASCADE;
-- 11. DROP FUNCTION duplicate_drawing(UUID, TEXT) CASCADE;

-- =============================================================================
-- END OF DEPLOYMENT SCRIPT
-- =============================================================================