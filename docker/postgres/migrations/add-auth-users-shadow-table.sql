-- =============================================================================
-- Migration: Add auth.users shadow table
-- =============================================================================
-- Date: 2025-10-28
-- Purpose: Create auth schema and users table for hybrid architecture
-- Run this ONCE on existing databases that don't have auth.users yet
-- =============================================================================

-- Create auth schema (if not exists)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users shadow table
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Comments
COMMENT ON SCHEMA auth IS 'Shadow schema for Supabase Cloud authentication';
COMMENT ON TABLE auth.users IS 'Shadow table mirroring Supabase auth.users (IDs only)';

-- Migrate existing profile IDs to auth.users
-- This ensures all existing users have entries in auth.users
INSERT INTO auth.users (id, email, created_at)
SELECT id, email, created_at
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: auth.users shadow table created and populated';
END $$;
