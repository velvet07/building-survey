'use server';

import { revalidatePath } from 'next/cache';
import { query, getCurrentUserId } from '@/lib/db';
import { createUser, hashPassword } from '@/lib/auth/local';

/**
 * Get current user's role from local database
 * Used by useUserRole hook
 */
export async function getCurrentUserRoleAction() {
  try {
    const userId = await getCurrentUserId();

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
  const userId = await getCurrentUserId();

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
    const result = await query(
      `UPDATE profiles
       SET role = ?, full_name = ?
       WHERE id = ?
       RETURNING *`,
      [role, fullName, userId]
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
    const result = await query(
      `UPDATE profiles
       SET full_name = ?, role = ?, updated_at = NOW()
       WHERE id = ?
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

// Update user role only (admin only)
export async function updateUserRoleAction(
  userId: string,
  role: 'admin' | 'user' | 'viewer'
) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  try {
    const result = await query(
      `UPDATE profiles
       SET role = ?, updated_at = NOW()
       WHERE id = ?
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
export async function deleteUserAction(userId: string) {
  if (!await isAdmin()) {
    return { data: null, error: new Error('Unauthorized: Admin access required') };
  }

  // Check self-deletion
  const currentUserId = await getCurrentUserId();
  const isSelfDeletion = currentUserId === userId;

  try {
    // Delete from profiles (CASCADE will handle related data)
    const result = await query(
      `DELETE FROM profiles
       WHERE id = ?
       RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('User not found') };
    }

    // Also delete from users table
    await query('DELETE FROM users WHERE id = ?', [userId]);

    revalidatePath('/dashboard/users');
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
