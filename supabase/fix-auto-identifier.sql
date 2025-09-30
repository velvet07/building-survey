-- =============================================================================
-- FIX: Auto Identifier Duplicate Key Error
-- =============================================================================
-- Probléma: A generate_project_identifier() function nem kezeli jól az eseteket
--           amikor már létezik ugyanaz az identifier
-- Megoldás: Módosítjuk a function-t hogy jobban generáljon unique értékeket

-- 1. Drop old constraint
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_auto_identifier_key;

-- 2. Frissítsük a generate_project_identifier function-t
CREATE OR REPLACE FUNCTION generate_project_identifier()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  today_count INTEGER;
  new_identifier TEXT;
  max_attempts INTEGER := 100;
  attempt_count INTEGER := 0;
BEGIN
  -- Mai dátum formázása YYYYMMDD formátumban
  today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  LOOP
    -- Mai projektek számának lekérdezése (beleértve a törölteket is!)
    SELECT COUNT(*)
    INTO today_count
    FROM public.projects
    WHERE auto_identifier LIKE 'PROJ-' || today_date || '-%';

    -- Következő szekvenciális szám
    today_count := today_count + 1;

    -- Új identifier generálása
    new_identifier := 'PROJ-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0');

    -- Ellenőrizzük hogy ez az identifier már létezik-e
    IF NOT EXISTS (
      SELECT 1 FROM public.projects WHERE auto_identifier = new_identifier
    ) THEN
      -- Ha nem létezik, használhatjuk
      RETURN new_identifier;
    END IF;

    -- Ha létezik, próbáljunk újra
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      -- Ha túl sok próbálkozás, adjunk hozzá random számot
      new_identifier := 'PROJ-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0') || '-' || floor(random() * 1000)::TEXT;
      RETURN new_identifier;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Opcionális: Töröljük a tesztprojekteket
-- CSAK akkor futtasd ha biztos vagy benne!
-- DELETE FROM public.projects WHERE name LIKE '%Test%' OR name LIKE '%Debug%';

COMMENT ON FUNCTION generate_project_identifier() IS 'Generál egy egyedi projekt azonosítót PROJ-YYYYMMDD-NNN formátumban, ütközések kezelésével';