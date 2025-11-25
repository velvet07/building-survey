/**
 * MySQL Database Connection Pool
 *
 * This module provides a connection pool to the local MySQL/MariaDB database.
 * All data (users, sessions, projects, drawings, forms, photos, profiles) is stored locally.
 */

import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Singleton pattern - create only one pool instance
let pool: Pool | null = null;

/**
 * Get or create MySQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    const dbName = process.env.DB_NAME || 'building_survey';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';

    // Use DATABASE_URL if provided, otherwise use individual components
    if (databaseUrl) {
      // Parse mysql://user:password@host:port/database
      const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (urlMatch) {
        const [, user, password, host, port, database] = urlMatch;
        pool = mysql.createPool({
          host,
          port: parseInt(port, 10),
          user,
          password,
          database,
          waitForConnections: true,
          connectionLimit: 20,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        });
      } else {
        throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
      }
    } else {
      pool = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
    }

    console.log('✓ MySQL connection pool created');
  }

  return pool;
}

/**
 * Convert PostgreSQL-style parameters ($1, $2) to MySQL-style (?)
 */
function convertParams(query: string, params?: any[]): string {
  if (!params || params.length === 0) {
    return query;
  }

  // Replace $1, $2, etc. with ?
  let converted = query;
  for (let i = params.length; i > 0; i--) {
    const regex = new RegExp(`\\$${i}\\b`, 'g');
    converted = converted.replace(regex, '?');
  }

  return converted;
}

/**
 * Query result type compatible with PostgreSQL-style
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
}

/**
 * Execute a query
 *
 * @param text - SQL query string (PostgreSQL-style $1, $2 will be converted to ?)
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    // Convert PostgreSQL-style parameters to MySQL-style
    const mysqlQuery = convertParams(text, params);
    
    const [rows] = await pool.execute<RowDataPacket[]>(mysqlQuery, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    // Convert MySQL result to PostgreSQL-style format
    const result: QueryResult<T> = {
      rows: rows as T[],
      rowCount: Array.isArray(rows) ? rows.length : (rows as ResultSetHeader).affectedRows || 0,
      command: 'SELECT',
    };

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Get a connection from the pool for transactions
 *
 * Usage:
 * ```
 * const connection = await getConnection();
 * try {
 *   await connection.beginTransaction();
 *   // ... multiple queries
 *   await connection.commit();
 * } catch (error) {
 *   await connection.rollback();
 *   throw error;
 * } finally {
 *   connection.release();
 * }
 * ```
 */
export async function getConnection(): Promise<PoolConnection> {
  const pool = getPool();
  return await pool.getConnection();
}

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ MySQL connection pool closed');
  }
}

/**
 * Helper: Get authenticated user ID from session
 * This will be implemented in the auth module
 */
export async function getCurrentUserId(): Promise<string | null> {
  // This will be implemented in lib/auth/local.ts
  // For now, return null to avoid breaking existing code
  const { getSession } = await import('@/lib/auth/local');
  const session = await getSession();
  return session?.userId || null;
}

/**
 * Helper: Get user profile from local database
 */
export async function getUserProfile(userId: string) {
  const result = await query<{
    id: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    full_name: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, email, role, full_name, created_at, updated_at FROM profiles WHERE id = ?',
    [userId]
  );

  return result.rows[0] || null;
}
