-- =============================================================================
-- Migration: Add full_name column to profiles table
-- =============================================================================
-- Date: 2025-10-28
-- Purpose: Add full_name column to store user display names locally
-- Run this ONCE on existing databases
-- =============================================================================

-- Add full_name column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Column full_name added to public.profiles';
  ELSE
    RAISE NOTICE 'Column full_name already exists in public.profiles';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.profiles.full_name IS 'User full name (display name)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: full_name column added to profiles';
END $$;
