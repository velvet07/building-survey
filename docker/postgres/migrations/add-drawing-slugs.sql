-- =============================================================================
-- Migration: Add Slug Support to Drawings Table (if missing)
-- =============================================================================
-- Date: 2025-10-28
-- Description:
--   Adds slug support to drawings table for user-friendly URLs
--   This migration is safe to run multiple times (idempotent)
-- =============================================================================

-- Add slug column to drawings table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'drawings'
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.drawings ADD COLUMN slug TEXT UNIQUE;
        CREATE INDEX idx_drawings_slug ON public.drawings(slug);

        ALTER TABLE public.drawings
        ADD CONSTRAINT drawing_slug_format
        CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$');

        RAISE NOTICE 'Added slug column to drawings table';
    ELSE
        RAISE NOTICE 'Slug column already exists';
    END IF;
END $$;

-- Function: Generate slug from drawing name
CREATE OR REPLACE FUNCTION generate_drawing_slug(drawing_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(drawing_name);

  -- Replace Hungarian characters
  slug := REPLACE(slug, 'á', 'a');
  slug := REPLACE(slug, 'é', 'e');
  slug := REPLACE(slug, 'í', 'i');
  slug := REPLACE(slug, 'ó', 'o');
  slug := REPLACE(slug, 'ö', 'o');
  slug := REPLACE(slug, 'ő', 'o');
  slug := REPLACE(slug, 'ú', 'u');
  slug := REPLACE(slug, 'ü', 'u');
  slug := REPLACE(slug, 'ű', 'u');

  -- Replace spaces and special characters with hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);

  -- Ensure slug is not empty
  IF slug = '' THEN
    slug := 'rajz';
  END IF;

  RETURN slug;
END;
$$;

-- Trigger function: Auto-generate unique slug on INSERT/UPDATE
CREATE OR REPLACE FUNCTION auto_generate_drawing_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 1;
BEGIN
  -- Only generate slug if not provided or name changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND NEW.name != OLD.name) THEN
    -- Generate base slug from name
    base_slug := generate_drawing_slug(NEW.name);
    final_slug := base_slug;

    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
      SELECT 1 FROM public.drawings
      WHERE slug = final_slug
      AND id != NEW.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS auto_generate_drawing_slug_trigger ON public.drawings;
CREATE TRIGGER auto_generate_drawing_slug_trigger
  BEFORE INSERT OR UPDATE ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_drawing_slug();

-- Generate slugs for existing drawings without slug
DO $$
DECLARE
  drawing_record RECORD;
BEGIN
  FOR drawing_record IN
    SELECT id, name FROM public.drawings WHERE slug IS NULL
  LOOP
    -- Trigger will generate the slug
    UPDATE public.drawings
    SET name = name  -- This triggers the slug generation
    WHERE id = drawing_record.id;
  END LOOP;

  RAISE NOTICE 'Generated slugs for existing drawings';
END $$;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
