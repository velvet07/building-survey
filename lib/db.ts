/**
 * PostgreSQL Database Connection Pool
 *
 * This module provides a connection pool to the local PostgreSQL database.
 * Supabase is ONLY used for authentication (email/password login).
 * All data (projects, drawings, forms, photos, profiles) is stored in local PostgreSQL.
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Singleton pattern - create only one pool instance
let pool: Pool | null = null;

/**
 * Get or create PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please set it in your .env file or docker-compose.yml'
      );
    }

    pool = new Pool({
      connectionString: databaseUrl,
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Fail if connection takes more than 2 seconds
    });

    // Log pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    console.log('✓ PostgreSQL connection pool created');
  }

  return pool;
}

/**
 * Execute a query
 *
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 *
 * Usage:
 * ```
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... multiple queries
 *   await client.query('COMMIT');
 * } catch (error) {
 *   await client.query('ROLLBACK');
 *   throw error;
 * } finally {
 *   client.release();
 * }
 * ```
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ PostgreSQL connection pool closed');
  }
}

/**
 * Helper: Get authenticated user ID from Supabase session
 * This is used in Server Components and API routes
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Import dynamically to avoid circular dependencies
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Helper: Get user profile from local database
 */
export async function getUserProfile(userId: string) {
  const result = await query(
    'SELECT id, email, role, full_name, avatar_url, created_at, updated_at FROM public.profiles WHERE id = $1',
    [userId]
  );

  return result.rows[0] || null;
}
