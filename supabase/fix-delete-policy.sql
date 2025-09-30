-- Fix: Users can soft delete own projects policy
-- The WITH CHECK was too restrictive

-- Drop the old policy
DROP POLICY IF EXISTS "Users can soft delete own projects" ON public.projects;

-- Create new policy that allows setting deleted_at
CREATE POLICY "Users can soft delete own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL  -- Can only delete non-deleted projects
)
WITH CHECK (
  owner_id = auth.uid()
  -- Allow setting deleted_at (no check on deleted_at value)
);

-- Note: This allows users to soft delete their own projects
-- The USING clause ensures they can only target non-deleted projects
-- The WITH CHECK only verifies ownership, allowing deleted_at to be set