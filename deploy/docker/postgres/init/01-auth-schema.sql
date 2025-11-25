-- =============================================================================
-- AUTH SCHEMA - Shadow tables for Supabase Cloud Auth
-- =============================================================================
-- This creates a minimal auth schema with a users table to satisfy foreign
-- key constraints. The actual authentication happens in Supabase Cloud.
-- This is just a shadow/mirror table for storing user IDs locally.
-- =============================================================================

-- Create auth schema (if not exists)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users shadow table
-- This only stores user IDs that exist in Supabase Cloud
-- The actual user data (email, password, etc.) is in Supabase
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Comment
COMMENT ON SCHEMA auth IS 'Shadow schema for Supabase Cloud authentication';
COMMENT ON TABLE auth.users IS 'Shadow table mirroring Supabase auth.users (IDs only)';
COMMENT ON COLUMN auth.users.id IS 'User UUID from Supabase Cloud Auth';
COMMENT ON COLUMN auth.users.email IS 'User email (cached from Supabase for reference)';
