-- ============================================
-- FIX: Project UPDATE Policies
-- ============================================
-- Problem: Conflicting policies prevent soft delete
-- Solution: Drop all project UPDATE policies and recreate them properly

-- Drop ALL existing UPDATE policies for projects
DROP POLICY IF EXISTS "Admins can update any non-deleted project" ON public.projects;
DROP POLICY IF EXISTS "Users can update own non-deleted projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can soft delete any project" ON public.projects;
DROP POLICY IF EXISTS "Users can soft delete own projects" ON public.projects;

-- ============================================
-- NEW POLICIES: Simplified and working
-- ============================================

-- Policy 1: Admins can update/delete any project
CREATE POLICY "admin_can_update_projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy 2: Users can update/delete ONLY their own projects
CREATE POLICY "user_can_update_own_projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'user'
)
WITH CHECK (
  owner_id = auth.uid()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'user'
);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, test:
-- 1. User can edit their own project name
-- 2. User can soft-delete their own project (set deleted_at)
-- 3. User CANNOT edit/delete other users' projects
-- 4. Admin can edit/delete ANY project
-- ============================================