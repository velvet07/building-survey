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

// Helper function to check if user is admin
async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

// Get all users (admin only)
export async function getUsersAction() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return { data, error };
}

// Create new user (admin only)
export async function createUserAction(email: string, password: string, fullName: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { data: null, error: authError };
  }

  // Update profile with full name and role
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      role: role
    })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/users');
  }

  return { data, error };
}

// Update user (admin only)
export async function updateUserAction(userId: string, fullName: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      role: role,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/users');
  }

  return { data, error };
}

// Update user role only (admin only)
export async function updateUserRoleAction(userId: string, role: 'admin' | 'user' | 'viewer') {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: role,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/users');
  }

  return { data, error };
}

// Soft delete user (admin only)
export async function deleteUserAction(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Prevent self-deletion
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { data: null, error: new Error('Cannot delete your own account') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      deleted_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/users');
  }

  return { data, error };
}

// Restore deleted user (admin only)
export async function restoreUserAction(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  if (!await isAdmin(supabase)) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      deleted_at: null
    })
    .eq('id', userId)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/users');
  }

  return { data, error };
}
