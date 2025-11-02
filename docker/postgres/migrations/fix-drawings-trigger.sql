-- =============================================================================
-- Migration: Fix enforce_created_by_on_drawings Trigger
-- =============================================================================
-- Date: 2025-10-28
-- Description:
--   Fix the enforce_created_by_on_drawings trigger to work with local PostgreSQL.
--   The old trigger always tried to use auth.uid() which doesn't exist in local setup.
--   New trigger uses provided created_by value from application code.
-- =============================================================================

-- Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION enforce_created_by_on_drawings()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is already set (passed from application), use it
  -- This is required for local PostgreSQL where auth.uid() doesn't exist
  IF NEW.created_by IS NULL THEN
    -- Try to get from Supabase auth (if available)
    BEGIN
      NEW.created_by := auth.uid();
    EXCEPTION
      WHEN undefined_function THEN
        -- auth.uid() doesn't exist in local PostgreSQL
        NULL;
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  -- Validate that created_by is set
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a drawing';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enforce_created_by_on_drawings() IS
'Security trigger: Validates created_by field. Uses provided value from application or falls back to auth.uid() if available. Works with both local PostgreSQL and Supabase.';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
