-- Migration: Add slug field to drawings table
-- Purpose: Support slug-based URLs for drawings (e.g., /drawings/alaprajz-pince)

-- Step 1: Add slug column to drawings table
ALTER TABLE drawings
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Create function to generate slug from name (handles Hungarian characters)
CREATE OR REPLACE FUNCTION generate_drawing_slug(drawing_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 2;
BEGIN
  -- Convert to lowercase and replace Hungarian characters
  base_slug := LOWER(drawing_name);
  base_slug := TRANSLATE(base_slug, 'áéíóöőúüű', 'aeiooouuu');

  -- Replace non-alphanumeric characters with hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);

  -- Collapse multiple hyphens
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');

  -- Limit to 100 characters
  base_slug := SUBSTRING(base_slug, 1, 100);

  -- Remove trailing hyphen if any after truncation
  base_slug := REGEXP_REPLACE(base_slug, '-+$', '');

  RETURN base_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Populate slug for existing drawings
DO $$
DECLARE
  drawing_record RECORD;
  base_slug TEXT;
  unique_slug TEXT;
  counter INTEGER;
BEGIN
  -- Loop through all drawings that don't have a slug
  FOR drawing_record IN
    SELECT id, project_id, name
    FROM drawings
    WHERE slug IS NULL
    ORDER BY created_at ASC
  LOOP
    -- Generate base slug
    base_slug := generate_drawing_slug(drawing_record.name);
    unique_slug := base_slug;
    counter := 2;

    -- Ensure uniqueness within the project
    WHILE EXISTS (
      SELECT 1 FROM drawings
      WHERE project_id = drawing_record.project_id
        AND slug = unique_slug
        AND id != drawing_record.id
    ) LOOP
      unique_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    -- Update the drawing with the unique slug
    UPDATE drawings
    SET slug = unique_slug
    WHERE id = drawing_record.id;
  END LOOP;
END $$;

-- Step 4: Make slug NOT NULL after population
ALTER TABLE drawings
ALTER COLUMN slug SET NOT NULL;

-- Step 5: Create unique index on (project_id, slug) for better performance
CREATE UNIQUE INDEX IF NOT EXISTS drawings_project_slug_unique
ON drawings(project_id, slug)
WHERE deleted_at IS NULL;

-- Step 6: Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS drawings_slug_idx
ON drawings(slug)
WHERE deleted_at IS NULL;

-- Step 7: Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_drawing_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  unique_slug TEXT;
  counter INTEGER := 2;
BEGIN
  -- Only generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_drawing_slug(NEW.name);
    unique_slug := base_slug;

    -- Ensure uniqueness within the project
    WHILE EXISTS (
      SELECT 1 FROM drawings
      WHERE project_id = NEW.project_id
        AND slug = unique_slug
        AND id != NEW.id
        AND deleted_at IS NULL
    ) LOOP
      unique_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    NEW.slug := unique_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_generate_drawing_slug ON drawings;
CREATE TRIGGER trigger_auto_generate_drawing_slug
  BEFORE INSERT ON drawings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_drawing_slug();

-- Step 8: Create trigger to update slug when name changes
CREATE OR REPLACE FUNCTION update_drawing_slug_on_name_change()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  unique_slug TEXT;
  counter INTEGER := 2;
BEGIN
  -- Only regenerate slug if name has changed
  IF NEW.name != OLD.name THEN
    base_slug := generate_drawing_slug(NEW.name);
    unique_slug := base_slug;

    -- Ensure uniqueness within the project (excluding current drawing)
    WHILE EXISTS (
      SELECT 1 FROM drawings
      WHERE project_id = NEW.project_id
        AND slug = unique_slug
        AND id != NEW.id
        AND deleted_at IS NULL
    ) LOOP
      unique_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    NEW.slug := unique_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_update_drawing_slug_on_name_change ON drawings;
CREATE TRIGGER trigger_update_drawing_slug_on_name_change
  BEFORE UPDATE OF name ON drawings
  FOR EACH ROW
  EXECUTE FUNCTION update_drawing_slug_on_name_change();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: slug field added to drawings table with auto-generation';
END $$;
