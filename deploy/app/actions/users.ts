'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth/local';
import { createUser, hashPassword } from '@/lib/auth/local';

/**
 * Get current user's role from local database
 * Used by useUserRole hook
 */
export async function getCurrentUserRoleAction() {
  try {
    const session = await getSession();
    const userId = session?.userId || null;

    if (!userId) {
      return { role: null, error: null };
    }

    const result = await query(
      'SELECT role FROM profiles WHERE id = ?',
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
async function isAdmin() {
  const session = await getSession();
  const userId = session?.userId || null;

  if (!userId) {
    return false;
  }

  const result = await query(
    'SELECT role FROM profiles WHERE id = ?',
    [userId]
  );

  const profile = result.rows[0];
  return profile?.role === 'admin';
}

// Get all users (admin only)
export async function getUsersAction() {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    const result = await query(
      `SELECT id, email, full_name, role, created_at, updated_at
       FROM profiles
       ORDER BY created_at DESC`
    );
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('getUsersAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Create new user (admin only)
export async function createUserAction(
  email: string,
  password: string,
  fullName: string,
  role: 'admin' | 'user' | 'viewer'
) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    // Check if user already exists
    const existing = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.rows.length > 0) {
      return { data: null, error: new Error('User with this email already exists') };
    }

    // Create user
    const userId = await createUser(email, password, fullName);

    // Update role in profiles table
    await query(
      `UPDATE profiles
       SET role = ?, full_name = ?
       WHERE id = ?`,
      [role, fullName, userId]
    );

    // Fetch the updated profile (MySQL doesn't support RETURNING)
    const result = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('createUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Update user (admin only)
export async function updateUserAction(
  userId: string,
  fullName: string,
  role: 'admin' | 'user' | 'viewer'
) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    await query(
      `UPDATE profiles
       SET full_name = ?, role = ?, updated_at = NOW()
       WHERE id = ?`,
      [fullName, role, userId]
    );

    // Fetch the updated profile (MySQL doesn't support RETURNING)
    const result = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
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

// Update user role only (admin only)
export async function updateUserRoleAction(
  userId: string,
  role: 'admin' | 'user' | 'viewer'
) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    await query(
      `UPDATE profiles
       SET role = ?, updated_at = NOW()
       WHERE id = ?`,
      [role, userId]
    );

    // Fetch the updated profile (MySQL doesn't support RETURNING)
    const result = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
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
export async function deleteUserAction(userId: string) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Check self-deletion
  const session = await getSession();
  const currentUserId = session?.userId || null;
  const isSelfDeletion = currentUserId === userId;

  try {
    // First fetch the profile before deletion (MySQL doesn't support RETURNING)
    const result = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    const deletedProfile = result.rows[0];

    // Delete from users table (CASCADE will handle profiles via foreign key)
    await query('DELETE FROM users WHERE id = ?', [userId]);

    revalidatePath('/dashboard/users');
    return { data: deletedProfile, error: null };
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
