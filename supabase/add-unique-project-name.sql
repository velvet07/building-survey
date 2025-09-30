-- =============================================================================
-- ADD: Unique Project Name Constraint (Per User)
-- =============================================================================
-- Probléma: Ugyanazt a projekt nevet többször is létre lehet hozni
-- Megoldás: Unique constraint a name + owner_id + deleted_at kombinációra

-- Egy user nem hozhat létre két aktív projektet ugyanazzal a névvel
-- De ha az egyik törölt (deleted_at IS NOT NULL), akkor létrehozhat újat ugyanazzal a névvel

-- 1. Először töröljük a duplikátumokat (ha vannak)
-- Ez a query megmutatja a duplikátumokat:
-- SELECT owner_id, name, COUNT(*) as count
-- FROM public.projects
-- WHERE deleted_at IS NULL
-- GROUP BY owner_id, name
-- HAVING COUNT(*) > 1;

-- 2. Unique constraint hozzáadása (partial index - csak aktív projektekre)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_project_name_per_user
ON public.projects (owner_id, name)
WHERE deleted_at IS NULL;

COMMENT ON INDEX unique_active_project_name_per_user IS 'Biztosítja hogy egy user ne hozhasson létre több aktív projektet ugyanazzal a névvel';