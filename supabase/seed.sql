-- =============================================================================
-- Moduláris WebApp MVP - Test Data Seed Script
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-29
-- Készítette: Backend Engineer
-- =============================================================================

-- FIGYELEM: Ez a script test adatokat tölt be a development környezetbe
-- NE futtasd production-ben!

-- =============================================================================
-- 1. CLEAN UP (Opcionális - törli a meglévő test adatokat)
-- =============================================================================

-- Kommenteld ki, ha nem akarod törölni a meglévő adatokat
/*
DELETE FROM public.user_module_activations;
DELETE FROM public.projects WHERE auto_identifier LIKE 'PROJ-%';
DELETE FROM public.modules WHERE slug IN ('projects', 'dashboard', 'analytics');
DELETE FROM public.profiles WHERE email LIKE '%@example.com';
*/

-- =============================================================================
-- 2. TEST USERS (Auth + Profiles)
-- =============================================================================

-- FIGYELEM: Supabase Auth user-eket nem lehet közvetlenül SQL-ből létrehozni
-- Ezeket manuálisan kell regisztrálni a frontend-ről vagy Supabase Dashboard-ról

-- Alternatíva: Supabase Dashboard → Authentication → Users → Add user

-- Test User 1: Admin
-- Email: admin@example.com
-- Password: admin123
-- Role: admin (ezt majd a profiles táblában állítsd be)

-- Test User 2: User
-- Email: user@example.com
-- Password: user123
-- Role: user

-- Test User 3: Viewer
-- Email: viewer@example.com
-- Password: viewer123
-- Role: viewer

-- Miután létrehoztad a user-eket, frissítsd a role-jukat:
-- Helyettesítsd az UUID-ket a valós user ID-kkel!

/*
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

UPDATE public.profiles
SET role = 'user'
WHERE email = 'user@example.com';

UPDATE public.profiles
SET role = 'viewer'
WHERE email = 'viewer@example.com';
*/

-- =============================================================================
-- 3. MODULES - System Modules
-- =============================================================================

-- System modulok (már létrehozva a schema.sql-ben, de itt újra beszúrjuk ha szükséges)
INSERT INTO public.modules (name, slug, description, is_system)
VALUES
  ('Projekt modul', 'projects', 'Projektek létrehozása és kezelése', TRUE),
  ('Dashboard', 'dashboard', 'Főoldal és statisztikák', TRUE),
  ('Analitika', 'analytics', 'Jelentések és elemzések (későbbi feature)', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 4. TEST PROJECTS
-- =============================================================================

-- FIGYELEM: Az owner_id UUID-ket cseréld le a valós test user ID-kre!
-- Ezeket a Supabase Dashboard → Authentication → Users menüből tudod lekérdezni

-- Példa owner_id-k (CSERÉLD LE!):
-- Admin user ID: '11111111-1111-1111-1111-111111111111'
-- User user ID: '22222222-2222-2222-2222-222222222222'

-- Admin user projektjei (3 db)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Admin user ID lekérdezése email alapján
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';

  IF admin_user_id IS NOT NULL THEN
    -- Projekt 1
    INSERT INTO public.projects (name, owner_id, created_at)
    VALUES ('Admin Projekt 1', admin_user_id, NOW() - INTERVAL '10 days');

    -- Projekt 2
    INSERT INTO public.projects (name, owner_id, created_at)
    VALUES ('Admin Projekt 2', admin_user_id, NOW() - INTERVAL '5 days');

    -- Projekt 3
    INSERT INTO public.projects (name, owner_id, created_at)
    VALUES ('Admin Projekt 3', admin_user_id, NOW() - INTERVAL '1 day');
  END IF;
END $$;

-- User user projektjei (2 db)
DO $$
DECLARE
  user_user_id UUID;
BEGIN
  SELECT id INTO user_user_id FROM auth.users WHERE email = 'user@example.com';

  IF user_user_id IS NOT NULL THEN
    -- Projekt 1
    INSERT INTO public.projects (name, owner_id, created_at)
    VALUES ('User Projekt 1', user_user_id, NOW() - INTERVAL '7 days');

    -- Projekt 2
    INSERT INTO public.projects (name, owner_id, created_at)
    VALUES ('User Projekt 2', user_user_id, NOW() - INTERVAL '2 days');
  END IF;
END $$;

-- =============================================================================
-- 5. USER MODULE ACTIVATIONS
-- =============================================================================

-- Admin user: minden modul aktiválva
DO $$
DECLARE
  admin_user_id UUID;
  module_projects_id UUID;
  module_dashboard_id UUID;
  module_analytics_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  SELECT id INTO module_projects_id FROM public.modules WHERE slug = 'projects';
  SELECT id INTO module_dashboard_id FROM public.modules WHERE slug = 'dashboard';
  SELECT id INTO module_analytics_id FROM public.modules WHERE slug = 'analytics';

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_module_activations (user_id, module_id)
    VALUES
      (admin_user_id, module_projects_id),
      (admin_user_id, module_dashboard_id),
      (admin_user_id, module_analytics_id)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
END $$;

-- User user: projects és dashboard aktiválva
DO $$
DECLARE
  user_user_id UUID;
  module_projects_id UUID;
  module_dashboard_id UUID;
BEGIN
  SELECT id INTO user_user_id FROM auth.users WHERE email = 'user@example.com';
  SELECT id INTO module_projects_id FROM public.modules WHERE slug = 'projects';
  SELECT id INTO module_dashboard_id FROM public.modules WHERE slug = 'dashboard';

  IF user_user_id IS NOT NULL THEN
    INSERT INTO public.user_module_activations (user_id, module_id)
    VALUES
      (user_user_id, module_projects_id),
      (user_user_id, module_dashboard_id)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
END $$;

-- Viewer user: csak dashboard aktiválva (projects később megosztás után)
DO $$
DECLARE
  viewer_user_id UUID;
  module_dashboard_id UUID;
BEGIN
  SELECT id INTO viewer_user_id FROM auth.users WHERE email = 'viewer@example.com';
  SELECT id INTO module_dashboard_id FROM public.modules WHERE slug = 'dashboard';

  IF viewer_user_id IS NOT NULL THEN
    INSERT INTO public.user_module_activations (user_id, module_id)
    VALUES
      (viewer_user_id, module_dashboard_id)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
END $$;

-- =============================================================================
-- 6. VERIFICATION QUERIES
-- =============================================================================

-- Ezeket használd a seed sikerességének ellenőrzésére

-- Check modules
SELECT * FROM public.modules ORDER BY is_system DESC, name;

-- Check projects (csak ha test user-ek léteznek)
SELECT
  p.name,
  p.auto_identifier,
  pr.email AS owner_email,
  p.created_at,
  p.deleted_at
FROM public.projects p
LEFT JOIN public.profiles pr ON p.owner_id = pr.id
ORDER BY p.created_at DESC;

-- Check user module activations
SELECT
  pr.email,
  m.name AS module_name,
  uma.activated_at
FROM public.user_module_activations uma
JOIN public.profiles pr ON uma.user_id = pr.id
JOIN public.modules m ON uma.module_id = m.id
ORDER BY pr.email, m.name;

-- Check profiles with roles
SELECT email, role, created_at FROM public.profiles ORDER BY role, email;

-- =============================================================================
-- SEED DATA SUMMARY
-- =============================================================================

-- Expected data after successful seed:
-- - 3 Modules: projects (system), dashboard (system), analytics (non-system)
-- - 3 Test Users: admin@example.com, user@example.com, viewer@example.com
-- - 5 Test Projects: 3 for admin, 2 for user
-- - Module Activations: Admin (3), User (2), Viewer (1)

-- =============================================================================
-- MANUAL STEPS REQUIRED
-- =============================================================================

-- 1. Create test users in Supabase Dashboard:
--    - Navigate to Authentication → Users → Add user
--    - Create: admin@example.com / admin123
--    - Create: user@example.com / user123
--    - Create: viewer@example.com / viewer123

-- 2. Run this seed.sql script in SQL Editor

-- 3. Verify with the verification queries above

-- 4. Update profiles role if auto-creation didn't work:
/*
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
UPDATE public.profiles SET role = 'user' WHERE email = 'user@example.com';
UPDATE public.profiles SET role = 'viewer' WHERE email = 'viewer@example.com';
*/

-- =============================================================================
-- END OF SEED SCRIPT
-- =============================================================================