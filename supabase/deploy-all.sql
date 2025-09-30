-- =================================================================
-- Building Survey MVP - Complete Database Setup
-- =================================================================
-- Run this file in Supabase SQL Editor to set up everything at once
--
-- This file combines:
-- 1. schema.sql - Tables and types
-- 2. functions.sql - Functions and triggers
-- 3. policies.sql - Row Level Security
--
-- Execution order is critical - do not modify!
-- =================================================================

-- =================================================================
-- PART 1: SCHEMA (Tables and Types)
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');

-- Create ENUM for module types
CREATE TYPE module_type AS ENUM ('buildings', 'surveys', 'reports', 'analytics', 'settings');

-- =================================================================
-- TABLE: profiles
-- User profile with role-based access control
-- =================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =================================================================
-- TABLE: projects
-- Core projects table with soft delete
-- =================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    auto_identifier TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 255)
);

-- =================================================================
-- TABLE: modules
-- Available system modules
-- =================================================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type module_type NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- TABLE: user_module_activations
-- User-specific module activations
-- =================================================================
CREATE TABLE IF NOT EXISTS user_module_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,

    UNIQUE(user_id, module_id)
);

-- =================================================================
-- INDEXES
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_auto_identifier ON projects(auto_identifier);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_modules_type ON modules(type);
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON modules(is_active);

CREATE INDEX IF NOT EXISTS idx_user_module_activations_user_id ON user_module_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_activations_module_id ON user_module_activations(module_id);

-- =================================================================
-- PART 2: FUNCTIONS AND TRIGGERS
-- =================================================================

-- =================================================================
-- FUNCTION: handle_new_user()
-- Auto-create profile when user signs up
-- =================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- TRIGGER: on_auth_user_created
-- =================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =================================================================
-- FUNCTION: update_updated_at()
-- Auto-update updated_at timestamp
-- =================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- TRIGGERS: Auto-update updated_at
-- =================================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =================================================================
-- FUNCTION: generate_project_identifier()
-- Generate auto identifier: PROJ-YYYYMMDD-NNN
-- =================================================================
CREATE OR REPLACE FUNCTION generate_project_identifier()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_identifier TEXT;
BEGIN
    -- Get date part (YYYYMMDD)
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');

    -- Get next sequence number for today
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(auto_identifier FROM 'PROJ-[0-9]{8}-([0-9]{3})')
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM projects
    WHERE auto_identifier LIKE 'PROJ-' || date_part || '-%';

    -- Generate new identifier
    new_identifier := 'PROJ-' || date_part || '-' || LPAD(sequence_num::TEXT, 3, '0');

    NEW.auto_identifier := new_identifier;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- TRIGGER: generate_project_identifier_trigger
-- =================================================================
DROP TRIGGER IF EXISTS generate_project_identifier_trigger ON projects;
CREATE TRIGGER generate_project_identifier_trigger
    BEFORE INSERT ON projects
    FOR EACH ROW
    WHEN (NEW.auto_identifier IS NULL OR NEW.auto_identifier = '')
    EXECUTE FUNCTION generate_project_identifier();

-- =================================================================
-- FUNCTION: is_admin(UUID)
-- Check if user is admin
-- =================================================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = user_id
        AND role = 'admin'
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: is_owner(UUID, UUID)
-- Check if user owns a project
-- =================================================================
CREATE OR REPLACE FUNCTION is_owner(user_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM projects
        WHERE id = project_id
        AND owner_id = user_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: has_module_access(UUID, UUID)
-- Check if user has access to module
-- =================================================================
CREATE OR REPLACE FUNCTION has_module_access(user_id UUID, module_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_module_activations
        WHERE user_module_activations.user_id = has_module_access.user_id
        AND user_module_activations.module_id = has_module_access.module_id
        AND deactivated_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: get_user_role(UUID)
-- Get user role
-- =================================================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value
    FROM profiles
    WHERE id = user_id
    AND deleted_at IS NULL;

    RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: soft_delete_project(UUID)
-- Soft delete project
-- =================================================================
CREATE OR REPLACE FUNCTION soft_delete_project(project_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE projects
    SET deleted_at = NOW()
    WHERE id = project_id
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: restore_project(UUID)
-- Restore soft-deleted project
-- =================================================================
CREATE OR REPLACE FUNCTION restore_project(project_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE projects
    SET deleted_at = NULL
    WHERE id = project_id
    AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: get_active_projects_count(UUID)
-- Count active projects for user
-- =================================================================
CREATE OR REPLACE FUNCTION get_active_projects_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM projects
        WHERE owner_id = user_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- FUNCTION: get_user_statistics(UUID)
-- Get comprehensive user statistics
-- =================================================================
CREATE OR REPLACE FUNCTION get_user_statistics(user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', COUNT(*),
        'active_projects', COUNT(*) FILTER (WHERE deleted_at IS NULL),
        'deleted_projects', COUNT(*) FILTER (WHERE deleted_at IS NOT NULL),
        'oldest_project', MIN(created_at),
        'newest_project', MAX(created_at)
    )
    INTO stats
    FROM projects
    WHERE owner_id = user_id;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- =================================================================
-- Enable RLS on all tables
-- =================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_activations ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- PROFILES POLICIES
-- =================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON profiles FOR DELETE
    USING (is_admin(auth.uid()));

-- =================================================================
-- PROJECTS POLICIES
-- =================================================================

-- Users can view their own non-deleted projects
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    );

-- Users can create projects
CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Users can update their own non-deleted projects
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    );

-- Users can soft-delete their own projects
CREATE POLICY "Users can delete own projects"
    ON projects FOR UPDATE
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    )
    WITH CHECK (deleted_at IS NOT NULL);

-- Admins can view all projects (including deleted)
CREATE POLICY "Admins can view all projects"
    ON projects FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can create projects
CREATE POLICY "Admins can create projects"
    ON projects FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update all projects
CREATE POLICY "Admins can update all projects"
    ON projects FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete all projects
CREATE POLICY "Admins can delete all projects"
    ON projects FOR DELETE
    USING (is_admin(auth.uid()));

-- =================================================================
-- MODULES POLICIES
-- =================================================================

-- All authenticated users can view active modules
CREATE POLICY "Authenticated users can view active modules"
    ON modules FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND is_active = true
    );

-- Admins can view all modules
CREATE POLICY "Admins can view all modules"
    ON modules FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can create modules
CREATE POLICY "Admins can create modules"
    ON modules FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update modules
CREATE POLICY "Admins can update modules"
    ON modules FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete modules
CREATE POLICY "Admins can delete modules"
    ON modules FOR DELETE
    USING (is_admin(auth.uid()));

-- =================================================================
-- USER_MODULE_ACTIVATIONS POLICIES
-- =================================================================

-- Users can view their own module activations
CREATE POLICY "Users can view own module activations"
    ON user_module_activations FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all module activations
CREATE POLICY "Admins can view all module activations"
    ON user_module_activations FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can manage module activations
CREATE POLICY "Admins can manage module activations"
    ON user_module_activations FOR ALL
    USING (is_admin(auth.uid()));

-- =================================================================
-- SETUP COMPLETE
-- =================================================================

-- Insert default modules (optional but recommended)
INSERT INTO modules (name, type, description, is_active) VALUES
    ('Épületek', 'buildings', 'Épület adatok kezelése', true),
    ('Felmérések', 'surveys', 'Felmérések készítése és kezelése', true),
    ('Riportok', 'reports', 'Riportok generálása', true),
    ('Elemzések', 'analytics', 'Adatok elemzése és vizualizáció', true),
    ('Beállítások', 'settings', 'Rendszer beállítások', true)
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE 'Tables created: profiles, projects, modules, user_module_activations';
    RAISE NOTICE 'Functions created: 11 functions';
    RAISE NOTICE 'Triggers created: 4 triggers';
    RAISE NOTICE 'RLS Policies created: 19 policies';
    RAISE NOTICE 'Default modules inserted: 5 modules';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure Auth settings (Dashboard → Authentication)';
    RAISE NOTICE '2. Add redirect URLs: http://localhost:3000/auth/callback';
    RAISE NOTICE '3. Enable email provider';
    RAISE NOTICE '4. Create .env.local with your credentials';
    RAISE NOTICE '5. Run: npm install && npm run dev';
END $$;