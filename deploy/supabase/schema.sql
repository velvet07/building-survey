-- =============================================================================
-- Moduláris WebApp MVP - Database Schema
-- =============================================================================
-- Verzió: 1.0
-- Utolsó frissítés: 2025-09-29
-- Készítette: System Architect
-- =============================================================================

-- Megjegyzés: Ez a script tartalmazza a teljes database schema-t
-- Supabase alapértelmezetten már rendelkezik auth.users táblával
-- Mi csak kiegészítjük a saját oszlopokkal és létrehozzuk a custom táblákat

-- =============================================================================
-- 1. USERS TÁBLA KIEGÉSZÍTÉSE
-- =============================================================================

-- Supabase auth.users táblához role oszlop hozzáadása
-- Megjegyzés: Ez a tábla már létezik, csak kiegészítjük

-- Role enum típus létrehozása
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');

-- Role oszlop hozzáadása az auth.users táblához
-- Megjegyzés: Supabase-ben ez a public.profiles táblán keresztül történik
-- Ezért létrehozunk egy profiles táblát a user metaadatoknak

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index létrehozása role oszlopon (gyakori query)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Komment hozzáadása
COMMENT ON TABLE public.profiles IS 'User profile és role információk';
COMMENT ON COLUMN public.profiles.role IS 'User szerepkör: admin, user, vagy viewer';

-- =============================================================================
-- 2. PROJECTS TÁBLA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  auto_identifier TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Index-ek létrehozása
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON public.projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_auto_identifier ON public.projects(auto_identifier);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Kommentek hozzáadása
COMMENT ON TABLE public.projects IS 'Projektek táblája';
COMMENT ON COLUMN public.projects.name IS 'Projekt név (3-100 karakter)';
COMMENT ON COLUMN public.projects.auto_identifier IS 'Automatikusan generált azonosító (PROJ-YYYYMMDD-NNN)';
COMMENT ON COLUMN public.projects.owner_id IS 'Projekt tulajdonos user ID';
COMMENT ON COLUMN public.projects.deleted_at IS 'Soft delete timestamp (NULL = aktív, NOT NULL = törölt)';

-- =============================================================================
-- 3. MODULES TÁBLA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index létrehozása slug oszlopon
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_is_system ON public.modules(is_system);

-- Kommentek hozzáadása
COMMENT ON TABLE public.modules IS 'Elérhető modulok listája';
COMMENT ON COLUMN public.modules.slug IS 'Modul egyedi azonosítója (lowercase, dash-separated)';
COMMENT ON COLUMN public.modules.is_system IS 'System modul flag (true = törölhetetlen core modul)';

-- =============================================================================
-- 4. USER_MODULE_ACTIVATIONS TÁBLA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_module_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),

  -- UNIQUE constraint: egy user csak egyszer aktiválhat egy modult
  CONSTRAINT unique_user_module UNIQUE (user_id, module_id)
);

-- Index-ek létrehozása
CREATE INDEX IF NOT EXISTS idx_user_module_activations_user_id ON public.user_module_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_activations_module_id ON public.user_module_activations(module_id);

-- Kommentek hozzáadása
COMMENT ON TABLE public.user_module_activations IS 'User és modul aktivációk many-to-many kapcsolata';
COMMENT ON COLUMN public.user_module_activations.user_id IS 'User ID';
COMMENT ON COLUMN public.user_module_activations.module_id IS 'Modul ID';

-- =============================================================================
-- 5. PROJECT_FORM_RESPONSES TÁBLA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  form_slug TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_form UNIQUE (project_id, form_slug)
);

CREATE INDEX IF NOT EXISTS idx_project_form_responses_project_id
  ON public.project_form_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_form_responses_form_slug
  ON public.project_form_responses(form_slug);

COMMENT ON TABLE public.project_form_responses IS 'Projekt űrlap válaszok (Aquapol és további modulok)';
COMMENT ON COLUMN public.project_form_responses.form_slug IS 'Űrlap slug (pl. aquapol-form)';
COMMENT ON COLUMN public.project_form_responses.data IS 'Űrlap mezők JSON formátumban';

-- =============================================================================
-- 6. TRIGGER: AUTO-UPDATE updated_at OSZLOP
-- =============================================================================

-- Generic function az updated_at oszlop automatikus frissítéséhez
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger a profiles táblához
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger a projects táblához
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_form_responses_updated_at ON public.project_form_responses;
CREATE TRIGGER update_project_form_responses_updated_at
  BEFORE UPDATE ON public.project_form_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. TRIGGER: AUTO-CREATE PROFILE ON USER REGISTRATION
-- =============================================================================

-- Function: Automatikusan létrehozza a profile rekordot új user regisztrációjakor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users táblához
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 8. SEED DATA - SYSTEM MODULES
-- =============================================================================

-- Alapértelmezett system modulok beszúrása (ha még nincsenek)
INSERT INTO public.modules (name, slug, description, is_system)
VALUES
  ('Projekt modul', 'projects', 'Projektek létrehozása és kezelése', TRUE),
  ('Dashboard', 'dashboard', 'Főoldal és statisztikák', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS) ENGEDÉLYEZÉSE
-- =============================================================================

-- RLS engedélyezése minden táblára
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_form_responses ENABLE ROW LEVEL SECURITY;

-- Megjegyzés: A konkrét RLS policy-k a policies.sql fájlban találhatók

-- =============================================================================
-- 10. GRANTS - Alapértelmezett jogosultságok
-- =============================================================================

-- Authenticated user-ek számára alapértelmezett SELECT jogosultság
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- SCHEMA SUMMARY
-- =============================================================================

-- Táblák:
-- 1. public.profiles (User profile + role)
-- 2. public.projects (Projektek)
-- 3. public.modules (Modulok)
-- 4. public.user_module_activations (User-modul kapcsolatok)
-- 5. public.project_form_responses (Projekt űrlap válaszok)

-- Enum típusok:
-- 1. user_role (admin, user, viewer)

-- Trigger-ek:
-- 1. update_profiles_updated_at (Auto-update updated_at)
-- 2. update_projects_updated_at (Auto-update updated_at)
-- 3. update_project_form_responses_updated_at (Auto-update updated_at)
-- 4. on_auth_user_created (Auto-create profile)
-- 5. auto_generate_project_identifier (functions.sql-ben)

-- Index-ek:
-- 1. idx_profiles_role
-- 2. idx_projects_owner_id
-- 3. idx_projects_deleted_at
-- 4. idx_projects_auto_identifier
-- 5. idx_projects_created_at
-- 6. idx_modules_slug
-- 7. idx_modules_is_system
-- 8. idx_user_module_activations_user_id
-- 9. idx_user_module_activations_module_id
-- 10. idx_project_form_responses_project_id
-- 11. idx_project_form_responses_form_slug

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
