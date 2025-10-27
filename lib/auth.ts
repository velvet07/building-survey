import { createClient } from './supabase';

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getUserRole() {
  const { query, getCurrentUserId } = await import('./db');

  try {
    const userId = await getCurrentUserId();

    if (!userId) return null;

    const result = await query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}