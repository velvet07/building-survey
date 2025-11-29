/**
 * Authentication API
 * 
 * Client-side authentication functions
 */

export async function signUp(email: string, password: string, fullName?: string) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { data: null, error: data.error || 'Regisztrációs hiba' };
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { data: null, error: data.error || 'Bejelentkezési hiba' };
  }

  return { data, error: null };
}

export async function signOut() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || 'Kijelentkezési hiba' };
  }

  return { error: null };
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me');

  if (!response.ok) {
    return { user: null, error: 'Nincs aktív munkamenet' };
  }

  const data = await response.json();
  return { user: data.user, error: null };
}

// Note: For server-side user role checking, use getCurrentUserRoleAction() from app/actions/users.ts
// This file is for client-side auth functions only
