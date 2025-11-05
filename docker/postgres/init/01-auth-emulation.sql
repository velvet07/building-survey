-- =============================================================================
-- Supabase Auth Emulation for Self-Hosted PostgreSQL
-- =============================================================================
-- This script creates the minimal auth schema needed for RLS policies to work
-- when using Supabase Cloud Auth with a self-hosted PostgreSQL database.
-- =============================================================================

-- Create auth schema (Supabase default)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table (minimal version)
-- This table will store user IDs synced from Supabase Cloud Auth
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'authenticated'
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Create auth.uid() function
-- This function returns the current authenticated user's ID
-- In self-hosted setup, this will be set via session variable
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claim.sub', TRUE),
        current_setting('app.current_user_id', TRUE)
    )::UUID;
$$;

-- Create auth.role() function
-- Returns the current user's role
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claim.role', TRUE),
        current_setting('app.current_user_role', TRUE),
        'anon'
    )::TEXT;
$$;

-- =============================================================================
-- Create roles FIRST (before granting permissions)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
END$$;

-- Grant permissions (AFTER roles are created)
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon;
GRANT ALL ON auth.users TO postgres;
GRANT SELECT ON auth.users TO authenticated;

-- Comments
COMMENT ON SCHEMA auth IS 'Auth schema emulating Supabase for self-hosted PostgreSQL';
COMMENT ON TABLE auth.users IS 'Users table synced from Supabase Cloud Auth';
COMMENT ON FUNCTION auth.uid() IS 'Returns current authenticated user ID';
COMMENT ON FUNCTION auth.role() IS 'Returns current user role';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO service_role;

-- =============================================================================
-- Helper function to sync user from Supabase
-- =============================================================================
-- This function will be called when a user logs in for the first time
-- It creates/updates the user record in the local auth.users table

CREATE OR REPLACE FUNCTION public.sync_user_from_supabase(
    user_id UUID,
    user_email TEXT,
    user_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO auth.users (id, email, raw_user_meta_data, updated_at)
    VALUES (user_id, user_email, user_metadata, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
        email = EXCLUDED.email,
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION public.sync_user_from_supabase IS 'Syncs user data from Supabase Cloud Auth to local PostgreSQL';

-- =============================================================================
-- Session management helper
-- =============================================================================
-- Set current user context (called by application on each request)

CREATE OR REPLACE FUNCTION public.set_current_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, FALSE);
END;
$$;

COMMENT ON FUNCTION public.set_current_user IS 'Sets the current user ID for RLS policies';

-- =============================================================================
-- END OF AUTH EMULATION
-- =============================================================================
