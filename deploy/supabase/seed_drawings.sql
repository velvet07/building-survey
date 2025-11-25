-- =============================================================================
-- Drawing Module - Test Data Seed
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-30
-- Készítette: Backend Engineer
-- Modul: Felmérés Rajzoló (Survey Drawing Module)
-- =============================================================================

-- Megjegyzés: Ez a script tartalmazza a rajzolás modul teszt adatait
-- Használat: fejlesztés és tesztelés során

-- FIGYELEM: Ez a seed script csak akkor fut le sikeresen, ha:
-- 1. Létezik legalább 1 projekt a projects táblában
-- 2. Létezik legalább 1 user az auth.users táblában

-- =============================================================================
-- 1. PROJEKT ELLENŐRZÉSE
-- =============================================================================

-- Megjegyzés: Ellenőrizzük, hogy van-e projekt a táblában
-- Ha nincs, a seed script hibát fog dobni

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1) THEN
    RAISE EXCEPTION 'Nincs projekt a projects táblában! Először hozz létre egy projektet a seed.sql segítségével.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE EXCEPTION 'Nincs user az auth.users táblában! Először hozz létre egy user-t a seed.sql segítségével.';
  END IF;
END $$;

-- =============================================================================
-- 2. TESZT RAJZOK LÉTREHOZÁSA
-- =============================================================================

-- Seed 1: Alaprajz (A4 álló, üres canvas)
-- Canvas méret: A4 portrait = 2480 x 3508 px @ 300 DPI
INSERT INTO public.drawings (project_id, name, canvas_data, paper_size, orientation, created_by)
VALUES (
  (SELECT id FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
  'Alaprajz',
  '{
    "version": "1.0",
    "strokes": [
      {
        "id": "stroke-1",
        "points": [100, 100, 200, 200, 300, 150, 400, 250],
        "color": "#000000",
        "width": 2,
        "timestamp": "2025-09-30T10:00:00.000Z"
      },
      {
        "id": "stroke-2",
        "points": [500, 300, 600, 400, 700, 350, 800, 450],
        "color": "#FF0000",
        "width": 3,
        "timestamp": "2025-09-30T10:01:00.000Z"
      }
    ],
    "metadata": {
      "canvas_width": 2480,
      "canvas_height": 3508,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a4',
  'portrait',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Seed 2: Homlokzat (A4 fekvő, több stroke)
-- Canvas méret: A4 landscape = 3508 x 2480 px @ 300 DPI
INSERT INTO public.drawings (project_id, name, canvas_data, paper_size, orientation, created_by)
VALUES (
  (SELECT id FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
  'Homlokzat',
  '{
    "version": "1.0",
    "strokes": [
      {
        "id": "stroke-3",
        "points": [200, 200, 300, 200, 300, 300, 200, 300, 200, 200],
        "color": "#0000FF",
        "width": 2,
        "timestamp": "2025-09-30T10:02:00.000Z"
      },
      {
        "id": "stroke-4",
        "points": [400, 400, 500, 500],
        "color": "#00FF00",
        "width": 4,
        "timestamp": "2025-09-30T10:03:00.000Z"
      },
      {
        "id": "stroke-5",
        "points": [600, 200, 700, 300, 800, 250, 900, 350],
        "color": "#FF00FF",
        "width": 2,
        "timestamp": "2025-09-30T10:04:00.000Z"
      }
    ],
    "metadata": {
      "canvas_width": 3508,
      "canvas_height": 2480,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a4',
  'landscape',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Seed 3: Alaprajz 2 (A4 álló, üres - auto-naming tesztelése)
-- Ez a rajz teszteli az auto-naming trigger-t
INSERT INTO public.drawings (project_id, canvas_data, paper_size, orientation, created_by)
VALUES (
  (SELECT id FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
  -- name mezőt nem adjuk meg, így a trigger auto-generálja: "Alaprajz 3"
  '{
    "version": "1.0",
    "strokes": [],
    "metadata": {
      "canvas_width": 2480,
      "canvas_height": 3508,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a4',
  'portrait',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Seed 4: Metszet (A3 álló, nagy canvas)
-- Canvas méret: A3 portrait = 3508 x 4960 px @ 300 DPI
INSERT INTO public.drawings (project_id, name, canvas_data, paper_size, orientation, created_by)
VALUES (
  (SELECT id FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
  'Metszet',
  '{
    "version": "1.0",
    "strokes": [
      {
        "id": "stroke-6",
        "points": [1000, 1000, 1500, 1500, 2000, 1200, 2500, 1800],
        "color": "#808080",
        "width": 5,
        "timestamp": "2025-09-30T10:05:00.000Z"
      }
    ],
    "metadata": {
      "canvas_width": 3508,
      "canvas_height": 4960,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a3',
  'portrait',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Seed 5: Soft deleted rajz (tesztelés céljából)
-- Ez a rajz törölt állapotban van (deleted_at IS NOT NULL)
INSERT INTO public.drawings (project_id, name, canvas_data, paper_size, orientation, created_by, deleted_at)
VALUES (
  (SELECT id FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
  'Törölt rajz (teszt)',
  '{
    "version": "1.0",
    "strokes": [
      {
        "id": "stroke-7",
        "points": [100, 100, 200, 200],
        "color": "#FF0000",
        "width": 2,
        "timestamp": "2025-09-30T09:00:00.000Z"
      }
    ],
    "metadata": {
      "canvas_width": 2480,
      "canvas_height": 3508,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a4',
  'portrait',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
  NOW() -- deleted_at beállítva (soft deleted)
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. TÖBB PROJEKT ESETÉN TOVÁBBI RAJZOK (OPCIONÁLIS)
-- =============================================================================

-- Seed 6: Második projekthez tartozó rajz (ha több projekt létezik)
INSERT INTO public.drawings (project_id, name, canvas_data, paper_size, orientation, created_by)
SELECT
  id,
  'Alaprajz',
  '{
    "version": "1.0",
    "strokes": [],
    "metadata": {
      "canvas_width": 2480,
      "canvas_height": 3508,
      "grid_size": 11.8
    }
  }'::jsonb,
  'a4',
  'portrait',
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
FROM public.projects
WHERE deleted_at IS NULL
ORDER BY created_at ASC
LIMIT 1 OFFSET 1
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. SEED ÖSSZEFOGLALÓ
-- =============================================================================

-- Beszúrt rajzok összefoglalása
DO $$
DECLARE
  total_drawings INTEGER;
  active_drawings INTEGER;
  deleted_drawings INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_drawings FROM public.drawings;
  SELECT COUNT(*) INTO active_drawings FROM public.drawings WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO deleted_drawings FROM public.drawings WHERE deleted_at IS NOT NULL;

  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'DRAWINGS SEED ÖSSZEFOGLALÓ';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Összes rajz: %', total_drawings;
  RAISE NOTICE 'Aktív rajzok: %', active_drawings;
  RAISE NOTICE 'Törölt rajzok: %', deleted_drawings;
  RAISE NOTICE '=============================================================================';
END $$;

-- =============================================================================
-- TESZTELÉSI PARANCSOK
-- =============================================================================

-- Teszt 1: Összes rajz lekérdezése
-- SELECT * FROM drawings ORDER BY created_at DESC;

-- Teszt 2: Aktív rajzok lekérdezése (deleted_at IS NULL)
-- SELECT * FROM drawings WHERE deleted_at IS NULL ORDER BY created_at DESC;

-- Teszt 3: Rajzok lekérdezése projektenként
-- SELECT project_id, COUNT(*) AS drawing_count
-- FROM drawings
-- WHERE deleted_at IS NULL
-- GROUP BY project_id;

-- Teszt 4: Auto-naming trigger tesztelése
-- INSERT INTO drawings (project_id, created_by)
-- VALUES (
--   (SELECT id FROM projects LIMIT 1),
--   (SELECT id FROM auth.users LIMIT 1)
-- );
-- Expected: name oszlop automatikusan "Alaprajz 4" (vagy következő szám)

-- Teszt 5: Rajz statisztikák
-- SELECT * FROM get_drawing_statistics((SELECT id FROM projects LIMIT 1));

-- Teszt 6: Soft delete tesztelése
-- SELECT soft_delete_drawing((SELECT id FROM drawings WHERE deleted_at IS NULL LIMIT 1));
-- Expected: TRUE

-- Teszt 7: Restore tesztelése
-- SELECT restore_drawing((SELECT id FROM drawings WHERE deleted_at IS NOT NULL LIMIT 1));
-- Expected: TRUE

-- Teszt 8: RLS policy tesztelése (user role-ként)
-- SET ROLE authenticated;
-- SELECT * FROM drawings;
-- Expected: csak saját projektek rajzai láthatók

-- =============================================================================
-- SEED DATA MAGYARÁZAT
-- =============================================================================

-- Seed rajzok:
-- 1. "Alaprajz" (A4 portrait, 2 stroke)
--    - Alap rajz, fekete és piros vonalakkal
--    - Canvas: 2480 x 3508 px
--
-- 2. "Homlokzat" (A4 landscape, 3 stroke)
--    - Fekvő formátum, többszínű vonalak
--    - Canvas: 3508 x 2480 px
--
-- 3. Auto-generated név (A4 portrait, 0 stroke)
--    - Trigger teszt: név automatikusan generálódik
--    - Üres canvas
--
-- 4. "Metszet" (A3 portrait, 1 stroke)
--    - Nagy formátum teszt
--    - Canvas: 3508 x 4960 px
--
-- 5. "Törölt rajz (teszt)" (A4 portrait, 1 stroke, DELETED)
--    - Soft delete teszt
--    - deleted_at IS NOT NULL

-- Canvas data struktúra:
-- - version: "1.0" (verziókezelés későbbi migrációkhoz)
-- - strokes: Array of stroke objects
--   - id: Egyedi azonosító (string)
--   - points: Flattened array [x1, y1, x2, y2, ...]
--   - color: Hex szín (#RRGGBB)
--   - width: Vonalvastagság (pixelben)
--   - timestamp: ISO8601 formátum
-- - metadata:
--   - canvas_width: Canvas szélesség (px)
--   - canvas_height: Canvas magasság (px)
--   - grid_size: Rács méret (px), 1mm @ 300 DPI = 11.8px

-- =============================================================================
-- END OF DRAWINGS SEED
-- =============================================================================