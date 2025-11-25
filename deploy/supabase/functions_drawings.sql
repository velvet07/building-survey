-- =============================================================================
-- Drawing Module - Database Functions
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-30
-- Készítette: Backend Engineer
-- Modul: Felmérés Rajzoló (Survey Drawing Module)
-- =============================================================================

-- Megjegyzés: Ez a fájl tartalmazza a rajzolás modul utility function-jeit
-- Tartalmazza: auto-naming function, trigger, helper function-ök

-- =============================================================================
-- 1. DRAWING AUTO-NAMING FUNCTION
-- =============================================================================

-- Function: Automatikusan generálja a rajz nevét egy projekten belül
-- Logika:
--   - Első rajz: "Alaprajz"
--   - További rajzok: "Alaprajz 2", "Alaprajz 3", stb.
-- Használat: SELECT generate_drawing_name('project-uuid');

CREATE OR REPLACE FUNCTION generate_drawing_name(proj_id UUID)
RETURNS TEXT AS $$
DECLARE
  drawing_count INTEGER;
BEGIN
  -- Számoljuk meg a projekt aktív (nem törölt) rajzait
  SELECT COUNT(*)
  INTO drawing_count
  FROM public.drawings
  WHERE project_id = proj_id
    AND deleted_at IS NULL;

  -- Első rajz esetén: "Alaprajz"
  IF drawing_count = 0 THEN
    RETURN 'Alaprajz';
  ELSE
    -- További rajzok: "Alaprajz 2", "Alaprajz 3", stb.
    RETURN 'Alaprajz ' || (drawing_count + 1)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION generate_drawing_name(UUID) IS
'Automatikusan generál rajz nevet projekten belül: első rajz = "Alaprajz", további = "Alaprajz 2", "Alaprajz 3", stb.';

-- =============================================================================
-- 2. DRAWING AUTO-NAMING TRIGGER FUNCTION
-- =============================================================================

-- Function: Trigger function amely automatikusan beállítja a rajz nevét INSERT előtt
-- Logika:
--   - Ha a name = 'Alaprajz' (alapértelmezett), akkor auto-generáljuk
--   - Ha custom név van megadva, akkor azt használjuk
-- Használat: Automatikusan fut BEFORE INSERT trigger-ként

CREATE OR REPLACE FUNCTION set_default_drawing_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Csak akkor generálunk automatikus nevet, ha az alapértelmezett "Alaprajz" van beállítva
  IF NEW.name = 'Alaprajz' THEN
    NEW.name := generate_drawing_name(NEW.project_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION set_default_drawing_name() IS
'Trigger function: automatikusan beállítja a rajz nevét INSERT előtt, ha alapértelmezett "Alaprajz" név van megadva';

-- =============================================================================
-- 3. DRAWING AUTO-NAMING TRIGGER LÉTREHOZÁSA
-- =============================================================================

-- Trigger létrehozása: automatikus név generálás INSERT előtt
DROP TRIGGER IF EXISTS auto_name_drawing ON public.drawings;
CREATE TRIGGER auto_name_drawing
  BEFORE INSERT ON public.drawings
  FOR EACH ROW
  EXECUTE FUNCTION set_default_drawing_name();

-- Komment hozzáadása
COMMENT ON TRIGGER auto_name_drawing ON public.drawings IS
'Automatikusan generálja a rajz nevét INSERT előtt, ha alapértelmezett "Alaprajz" név van megadva';

-- =============================================================================
-- 4. GET DRAWING COUNT FOR PROJECT
-- =============================================================================

-- Function: Lekérdezi egy projekt aktív rajzainak számát
-- Használat: SELECT get_project_drawing_count('project-uuid');

CREATE OR REPLACE FUNCTION get_project_drawing_count(proj_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_result
  FROM public.drawings
  WHERE project_id = proj_id
    AND deleted_at IS NULL;

  RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION get_project_drawing_count(UUID) IS
'Lekérdezi egy projekt aktív (nem törölt) rajzainak számát';

-- =============================================================================
-- 5. SOFT DELETE DRAWING HELPER FUNCTION
-- =============================================================================

-- Function: Soft delete végrehajtása egy rajzon
-- Használat: SELECT soft_delete_drawing('drawing-uuid');

CREATE OR REPLACE FUNCTION soft_delete_drawing(drawing_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Explicit security check: user owns the project or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.drawings d
    JOIN public.projects p ON d.project_id = p.id
    WHERE d.id = drawing_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not have permission to delete this drawing';
  END IF;

  -- Beállítja a deleted_at timestamp-et
  UPDATE public.drawings
  SET deleted_at = NOW()
  WHERE id = drawing_id
    AND deleted_at IS NULL;

  -- Ellenőrizzük, hogy történt-e módosítás
  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION soft_delete_drawing(UUID) IS
'Soft delete végrehajtása egy rajzon (beállítja a deleted_at timestamp-et)';

-- =============================================================================
-- 6. RESTORE DELETED DRAWING HELPER FUNCTION
-- =============================================================================

-- Function: Visszaállít egy soft deleted rajzot
-- Használat: SELECT restore_drawing('drawing-uuid');

CREATE OR REPLACE FUNCTION restore_drawing(drawing_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Explicit security check: user owns the project or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.drawings d
    JOIN public.projects p ON d.project_id = p.id
    WHERE d.id = drawing_id
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not have permission to restore this drawing';
  END IF;

  -- NULL-ra állítja a deleted_at mezőt
  UPDATE public.drawings
  SET deleted_at = NULL
  WHERE id = drawing_id
    AND deleted_at IS NOT NULL;

  -- Ellenőrizzük, hogy történt-e módosítás
  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION restore_drawing(UUID) IS
'Visszaállít egy soft deleted rajzot (NULL-ra állítja a deleted_at értékét)';

-- =============================================================================
-- 7. GET DRAWINGS FOR PROJECT (WITH PAGINATION)
-- =============================================================================

-- Function: Lekérdezi egy projekt rajzait paginálással
-- Használat: SELECT * FROM get_project_drawings('project-uuid', 10, 0);

CREATE OR REPLACE FUNCTION get_project_drawings(
  proj_id UUID,
  page_limit INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  paper_size paper_size_enum,
  orientation paper_orientation_enum,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  stroke_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.project_id,
    d.name,
    d.paper_size,
    d.orientation,
    d.created_by,
    d.created_at,
    d.updated_at,
    -- Strokes számának kiszámítása (JSONB array length)
    jsonb_array_length(d.canvas_data->'strokes')::INTEGER AS stroke_count
  FROM public.drawings d
  WHERE d.project_id = proj_id
    AND d.deleted_at IS NULL
  ORDER BY d.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION get_project_drawings(UUID, INTEGER, INTEGER) IS
'Lekérdezi egy projekt aktív rajzait paginálással (limit, offset), stroke számmal együtt';

-- =============================================================================
-- 8. GET DRAWING STATISTICS FOR PROJECT
-- =============================================================================

-- Function: Statisztikák lekérdezése egy projekt rajzairól
-- Használat: SELECT * FROM get_drawing_statistics('project-uuid');

CREATE OR REPLACE FUNCTION get_drawing_statistics(proj_id UUID)
RETURNS TABLE (
  total_drawings BIGINT,
  active_drawings BIGINT,
  deleted_drawings BIGINT,
  a4_portrait_count BIGINT,
  a4_landscape_count BIGINT,
  a3_portrait_count BIGINT,
  a3_landscape_count BIGINT,
  total_strokes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Összes rajz (töröltekkel együtt)
    COUNT(*) AS total_drawings,
    -- Aktív rajzok (deleted_at IS NULL)
    COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active_drawings,
    -- Törölt rajzok (deleted_at IS NOT NULL)
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_drawings,
    -- A4 portrait
    COUNT(*) FILTER (WHERE paper_size = 'a4' AND orientation = 'portrait' AND deleted_at IS NULL) AS a4_portrait_count,
    -- A4 landscape
    COUNT(*) FILTER (WHERE paper_size = 'a4' AND orientation = 'landscape' AND deleted_at IS NULL) AS a4_landscape_count,
    -- A3 portrait
    COUNT(*) FILTER (WHERE paper_size = 'a3' AND orientation = 'portrait' AND deleted_at IS NULL) AS a3_portrait_count,
    -- A3 landscape
    COUNT(*) FILTER (WHERE paper_size = 'a3' AND orientation = 'landscape' AND deleted_at IS NULL) AS a3_landscape_count,
    -- Összes stroke szám (aktív rajzokban)
    COALESCE(SUM(jsonb_array_length(canvas_data->'strokes')) FILTER (WHERE deleted_at IS NULL), 0) AS total_strokes
  FROM public.drawings
  WHERE project_id = proj_id;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION get_drawing_statistics(UUID) IS
'Statisztikák lekérdezése egy projekt rajzairól (összes rajz, aktív/törölt, papír méretek, strokes szám)';

-- =============================================================================
-- 9. DUPLICATE DRAWING (POST-MVP FEATURE)
-- =============================================================================

-- Function: Duplikálja egy rajzot (másolatot készít)
-- Használat: SELECT duplicate_drawing('drawing-uuid', 'Új név');

CREATE OR REPLACE FUNCTION duplicate_drawing(
  source_drawing_id UUID,
  new_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  source_drawing RECORD;
  new_drawing_id UUID;
BEGIN
  -- Lekérdezzük a forrás rajzot
  SELECT *
  INTO source_drawing
  FROM public.drawings
  WHERE id = source_drawing_id
    AND deleted_at IS NULL;

  -- Ha nem található a rajz, NULL-t adunk vissza
  IF source_drawing IS NULL THEN
    RETURN NULL;
  END IF;

  -- Új rajz név generálása (ha nincs megadva)
  IF new_name IS NULL THEN
    new_name := source_drawing.name || ' (Másolat)';
  END IF;

  -- Új rajz létrehozása (másolat)
  INSERT INTO public.drawings (
    project_id,
    name,
    canvas_data,
    paper_size,
    orientation,
    created_by
  )
  VALUES (
    source_drawing.project_id,
    new_name,
    source_drawing.canvas_data,
    source_drawing.paper_size,
    source_drawing.orientation,
    auth.uid()
  )
  RETURNING id INTO new_drawing_id;

  RETURN new_drawing_id;
END;
$$ LANGUAGE plpgsql;

-- Komment hozzáadása
COMMENT ON FUNCTION duplicate_drawing(UUID, TEXT) IS
'Duplikálja egy rajzot (másolatot készít canvas adatokkal együtt), visszaadja az új rajz UUID-jét';

-- =============================================================================
-- FUNCTIONS SUMMARY
-- =============================================================================

-- Létrehozott function-ök:
-- 1. generate_drawing_name(proj_id UUID) - Rajz név auto-generálás
-- 2. set_default_drawing_name() - Trigger function auto-névhez
-- 3. get_project_drawing_count(proj_id UUID) - Projekt rajzok száma
-- 4. soft_delete_drawing(drawing_id UUID) - Rajz soft delete
-- 5. restore_drawing(drawing_id UUID) - Törölt rajz visszaállítása
-- 6. get_project_drawings(proj_id UUID, limit INT, offset INT) - Rajzok paginálással
-- 7. get_drawing_statistics(proj_id UUID) - Rajz statisztikák
-- 8. duplicate_drawing(source_id UUID, new_name TEXT) - Rajz duplikálás (post-MVP)

-- Trigger-ek:
-- 1. auto_name_drawing - Automatikus név generálás BEFORE INSERT

-- =============================================================================
-- TESTING COMMANDS (Manual Testing)
-- =============================================================================

-- Test 1: Rajz név generálás
-- SELECT generate_drawing_name('project-uuid-here');
-- Expected: "Alaprajz" vagy "Alaprajz 2", "Alaprajz 3", stb.

-- Test 2: Rajz létrehozása (trigger tesztelés)
-- INSERT INTO drawings (project_id, created_by) VALUES ('project-uuid', 'user-uuid');
-- Expected: name oszlop automatikusan kitöltődik

-- Test 3: Projekt rajzok száma
-- SELECT get_project_drawing_count('project-uuid-here');
-- Expected: INTEGER (aktív rajzok száma)

-- Test 4: Rajz soft delete
-- SELECT soft_delete_drawing('drawing-uuid-here');
-- Expected: TRUE (ha sikeres)

-- Test 5: Rajz visszaállítása
-- SELECT restore_drawing('drawing-uuid-here');
-- Expected: TRUE (ha sikeres)

-- Test 6: Projekt rajzok lekérdezése paginálással
-- SELECT * FROM get_project_drawings('project-uuid-here', 10, 0);
-- Expected: Rajzok listája stroke számmal

-- Test 7: Rajz statisztikák
-- SELECT * FROM get_drawing_statistics('project-uuid-here');
-- Expected: Statisztikák (total, active, deleted, paper sizes, strokes)

-- Test 8: Rajz duplikálás
-- SELECT duplicate_drawing('drawing-uuid-here', 'Új rajz név');
-- Expected: UUID (új rajz ID)

-- =============================================================================
-- END OF DRAWINGS FUNCTIONS
-- =============================================================================