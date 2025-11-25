/**
 * Local Authentication Module
 * 
 * Handles user authentication using bcrypt for password hashing
 * and session management with MySQL database.
 */

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query, queryOne } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface Session {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  expiresAt: Date;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Store session in database
  await query(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (UUID(), ?, ?, ?)',
    [userId, token, expiresAt]
  );

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  });

  return token;
}

/**
 * Get the current session from cookie
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Get session from database
    const session = await queryOne<{
      user_id: string;
      expires_at: Date;
      email: string;
      role: 'admin' | 'user' | 'viewer';
    }>(
      `SELECT s.user_id, s.expires_at, u.email, p.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       JOIN profiles p ON u.id = p.id
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [token]
    );

    if (!session) {
      return null;
    }

    return {
      userId: session.user_id,
      email: session.email,
      role: session.role,
      expiresAt: session.expires_at,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      // Delete session from database
      await query('DELETE FROM sessions WHERE token = ?', [token]);
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await query('DELETE FROM sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return queryOne<{
    id: string;
    email: string;
    password_hash: string;
    full_name: string | null;
    created_at: Date;
  }>('SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?', [email]);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return queryOne<{
    id: string;
    email: string;
    full_name: string | null;
    created_at: Date;
  }>('SELECT id, email, full_name, created_at FROM users WHERE id = ?', [userId]);
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  fullName?: string
): Promise<string> {
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  // Create user
  await query(
    'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
    [userId, email, passwordHash, fullName || null]
  );

  // Profile is created automatically by trigger

  return userId;
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
}

