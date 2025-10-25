-- =============================================================================
-- Photos Module - Deployment Script
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-10-25
-- Készítette: Backend Engineer
-- =============================================================================

-- Ez a script telepíti a teljes Photos Module backend részét
-- Fontos: Hard delete (nincs soft delete)

-- HASZNÁLAT:
-- 1. Supabase SQL Editor-ben futtasd le ezt a script-et
-- 2. Vagy használd a Supabase CLI-t:
--    supabase db push

-- =============================================================================
-- DEPLOYMENT STEPS
-- =============================================================================

-- STEP 1: Schema létrehozása (tábla, index-ek, constraint-ek, trigger-ek, RLS)
\echo 'STEP 1: Creating photos schema and policies...'
\i schema_photos.sql

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Ellenőrzések futtatása a telepítés után
DO $$
DECLARE
  table_exists BOOLEAN;
  index_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
  constraint_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'PHOTOS MODULE DEPLOYMENT VERIFICATION';
  RAISE NOTICE '=============================================================================';

  -- 1. Tábla létezik?
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'photos'
  ) INTO table_exists;
  RAISE NOTICE '✓ Photos table exists: %', table_exists;

  -- 2. Index-ek léteznek?
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'photos';
  RAISE NOTICE '✓ Indexes created: % (expected: 4 - including UNIQUE on file_path)', index_count;

  -- 3. RLS policies léteznek?
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'photos';
  RAISE NOTICE '✓ RLS policies created: % (expected: 4)', policy_count;

  -- 4. Trigger-ek léteznek?
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgrelid = 'public.photos'::regclass
  AND tgname IN ('update_photos_updated_at', 'enforce_uploaded_by_trigger');
  RAISE NOTICE '✓ Triggers created: % (expected: 2)', trigger_count;

  -- 5. Constraint-ek léteznek?
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
  AND table_name = 'photos'
  AND constraint_type = 'CHECK';
  RAISE NOTICE '✓ CHECK constraints created: % (expected: 5)', constraint_count;

  RAISE NOTICE '=============================================================================';

  -- Összesített ellenőrzés
  IF table_exists AND index_count >= 3 AND policy_count = 4 AND trigger_count = 2 AND constraint_count = 5 THEN
    RAISE NOTICE '✅ DEPLOYMENT SUCCESSFUL - All components created successfully!';
  ELSE
    RAISE WARNING '⚠️  DEPLOYMENT INCOMPLETE - Some components are missing!';
    RAISE NOTICE 'Debug info: table=%, indexes=%, policies=%, triggers=%, constraints=%',
                 table_exists, index_count, policy_count, trigger_count, constraint_count;
  END IF;

  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- POST-DEPLOYMENT INSTRUCTIONS
-- =============================================================================

-- FONTOS: Storage bucket létrehozása (Supabase Dashboard-on):
--
-- 1. Menj a Storage > Create bucket
-- 2. Bucket név: project-photos
-- 3. Public: false (csak authenticated users)
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif
--
-- 6. Storage Policies (RLS):
--    a) SELECT policy:
--       - authenticated users láthatják saját projektjeik fotóit
--       - Policy: storage.objects WHERE bucket_id = 'project-photos'
--
--    b) INSERT policy:
--       - authenticated users feltölthetnek fotókat saját projektjeikhez
--       - Policy: storage.objects WHERE bucket_id = 'project-photos'
--
--    c) DELETE policy:
--       - authenticated users törölhetik saját projektjeik fotóit
--       - Policy: storage.objects WHERE bucket_id = 'project-photos'

-- =============================================================================
-- STORAGE POLICIES (manuálisan kell létrehozni a Supabase Dashboard-on)
-- =============================================================================

-- SELECT policy for storage bucket:
-- CREATE POLICY "Users can view their project photos"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'project-photos'
--   AND (storage.foldername(name))[1] IN (
--     SELECT id::text FROM public.projects
--     WHERE owner_id = auth.uid()
--     AND deleted_at IS NULL
--   )
-- );

-- INSERT policy for storage bucket:
-- CREATE POLICY "Users can upload photos to their projects"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'project-photos'
--   AND (storage.foldername(name))[1] IN (
--     SELECT id::text FROM public.projects
--     WHERE owner_id = auth.uid()
--     AND deleted_at IS NULL
--   )
-- );

-- DELETE policy for storage bucket:
-- CREATE POLICY "Users can delete photos from their projects"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'project-photos'
--   AND (storage.foldername(name))[1] IN (
--     SELECT id::text FROM public.projects
--     WHERE owner_id = auth.uid()
--     AND deleted_at IS NULL
--   )
-- );

-- =============================================================================
-- TESTING INSTRUCTIONS
-- =============================================================================

-- 1. RLS Policy tesztelés:
--    - Jelentkezz be user-ként és próbálj fotót feltölteni
--    - Ellenőrizd, hogy csak saját projektjeid fotóit látod

-- 2. Trigger tesztelés:
--    - Próbálj INSERT-et futtatni uploaded_by nélkül
--    - Ellenőrizd, hogy az uploaded_by automatikusan auth.uid()-re áll

-- 3. Constraint tesztelés:
--    - Próbálj invalid MIME típussal fotót feltölteni
--    - Próbálj 0 byte méretű fájlt feltölteni
--    - Próbálj túl hosszú caption-t megadni

-- 4. Query performance tesztelés:
--    EXPLAIN ANALYZE SELECT * FROM photos WHERE project_id = 'uuid-here';

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =============================================================================

-- Ha vissza kell állítani a telepítést:
-- 1. DROP TABLE public.photos CASCADE;
-- 2. DROP FUNCTION enforce_uploaded_by_on_photos() CASCADE;
-- 3. Töröld a storage bucket-et: project-photos

-- =============================================================================
-- END OF DEPLOYMENT SCRIPT
-- =============================================================================
