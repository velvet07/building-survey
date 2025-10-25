-- =============================================================================
-- Photos Module - Storage Bucket RLS Policies Setup
-- =============================================================================
-- Ezt a script-et futtasd a Supabase SQL Editor-ben
-- =============================================================================

-- FONTOS: Előtte manuálisan létre kell hozni a bucket-et a Supabase Dashboard-on:
-- 1. Storage > Create new bucket
-- 2. Name: project-photos
-- 3. Public: UNCHECKED (false)
-- 4. File size limit: 10485760 (10MB)
-- 5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp, image/heic, image/heif

-- =============================================================================
-- 1. SELECT Policy - Users can view their project photos
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their project photos" ON storage.objects;

CREATE POLICY "Users can view their project photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects
    WHERE owner_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- =============================================================================
-- 2. INSERT Policy - Users can upload photos to their projects
-- =============================================================================

DROP POLICY IF EXISTS "Users can upload photos to their projects" ON storage.objects;

CREATE POLICY "Users can upload photos to their projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects
    WHERE owner_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- =============================================================================
-- 3. UPDATE Policy - Users can update their project photos metadata
-- =============================================================================

DROP POLICY IF EXISTS "Users can update their project photos" ON storage.objects;

CREATE POLICY "Users can update their project photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects
    WHERE owner_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- =============================================================================
-- 4. DELETE Policy - Users can delete photos from their projects
-- =============================================================================

DROP POLICY IF EXISTS "Users can delete photos from their projects" ON storage.objects;

CREATE POLICY "Users can delete photos from their projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.projects
    WHERE owner_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- =============================================================================
-- Verification
-- =============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'STORAGE POLICIES VERIFICATION';
  RAISE NOTICE '=============================================================================';

  -- Count policies on storage.objects for project-photos bucket
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%project photos%';

  RAISE NOTICE '✓ Storage policies created: % (expected: 4)', policy_count;

  IF policy_count = 4 THEN
    RAISE NOTICE '✅ STORAGE POLICIES SUCCESSFULLY CREATED!';
  ELSE
    RAISE WARNING '⚠️  INCOMPLETE - Expected 4 policies, found %', policy_count;
  END IF;

  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- TESTING
-- =============================================================================

-- Test SELECT policy (should return true if you own any projects):
-- SELECT EXISTS (
--   SELECT 1 FROM storage.objects
--   WHERE bucket_id = 'project-photos'
-- );

-- Test upload from client-side by trying to upload a photo through the Photos UI

-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================

-- If uploads still fail, check:
-- 1. Is the bucket named exactly "project-photos"?
-- 2. Is the bucket set to PRIVATE (not public)?
-- 3. Are you logged in as an authenticated user?
-- 4. Do you own the project you're uploading to?
-- 5. Check browser console for detailed error messages

-- View all policies on storage.objects:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- =============================================================================
-- END OF STORAGE POLICIES SETUP
-- =============================================================================
