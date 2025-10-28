'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { query, getCurrentUserId } from '@/lib/db';

/**
 * Get current user's role from local PostgreSQL
 * Used by useUserRole hook
 */
export async function getCurrentUserRoleAction() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { role: null, error: null };
    }

    const result = await query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { role: null, error: null };
    }

    return { role: result.rows[0].role, error: null };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { role: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Helper function to check if user is admin (LOCAL POSTGRESQL)
async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Query local PostgreSQL instead of Supabase Cloud
  const result = await query(
    'SELECT role FROM public.profiles WHERE id = $1',
    [user.id]
  );

  const profile = result.rows[0];
  return profile?.role === 'admin';
}

// Get all users (admin only) (LOCAL POSTGRESQL)
export async function getUsersAction() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    // Query profiles table (no deleted_at column - users are never soft deleted)
    const result = await query(
      `SELECT id, email, full_name, role, created_at, updated_at
       FROM public.profiles
       ORDER BY created_at DESC`
    );
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('getUsersAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Create new user (admin only)
export async function createUserAction(email: string, password: string, fullName: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Create admin client for user creation (requires SERVICE_ROLE_KEY)
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Create auth user in Supabase Cloud Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { data: null, error: authError };
  }

  // Create user in local PostgreSQL (auth.users shadow + profiles)
  try {
    // First, insert into auth.users shadow table
    await query(
      `INSERT INTO auth.users (id, email, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
      [authData.user.id, email]
    );

    // Then, insert into profiles with full_name and role
    const result = await query(
      `INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         updated_at = NOW()
       RETURNING *`,
      [authData.user.id, email, fullName, role]
    );

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('createUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Update user (admin only) (LOCAL POSTGRESQL)
export async function updateUserAction(userId: string, fullName: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    const result = await query(
      `UPDATE public.profiles
       SET full_name = $1, role = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [fullName, role, userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('updateUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Update user role only (admin only) (LOCAL POSTGRESQL)
export async function updateUserRoleAction(userId: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    const result = await query(
      `UPDATE public.profiles
       SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('updateUserRoleAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Delete user (admin only)
// Permanently deletes from both Supabase Auth and local PostgreSQL
export async function deleteUserAction(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Check self-deletion (allow but track it)
  const { data: { user } } = await supabase.auth.getUser();
  const isSelfDeletion = user?.id === userId;

  try {
    // First, delete from local PostgreSQL
    // Foreign key CASCADE will handle auth.users deletion
    const result = await query(
      `DELETE FROM public.profiles
       WHERE id = $1
       RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    // Then, delete from Supabase Auth (cloud)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Supabase auth delete error:', authError);
      // Continue anyway - user is already deleted from local DB
    }

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Restore deleted user (admin only) (LOCAL POSTGRESQL)
export async function restoreUserAction(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    const result = await query(
      `UPDATE public.profiles
       SET deleted_at = NULL
       WHERE id = $1
       RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('restoreUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
