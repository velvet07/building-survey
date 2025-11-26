/**
 * Projects Module - MySQL Direct Connection
 *
 * All project data is stored in local MySQL/MariaDB database.
 */

import { query } from './db';
import { getSession } from './auth/local';
import { ProjectStatus } from '@/types/project.types';
import crypto from 'crypto';

export interface Project {
  id: string;
  name: string;
  status?: ProjectStatus;
  owner_id: string;
  auto_identifier: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Get all active projects (not deleted)
 * Ordered by creation date (newest first)
 */
export async function getProjects() {
  try {
    const result = await query<Project>(
      `SELECT * FROM projects
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    return { data: result.rows, error: null };
  } catch (error: any) {
    console.error('getProjects error:', error);
    return { data: null, error };
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string) {
  try {
    const result = await query<Project>(
      `SELECT * FROM projects
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('Project not found') };
    }

    return { data: result.rows[0], error: null };
  } catch (error: any) {
    console.error('getProjectById error:', error);
    return { data: null, error };
  }
}

/**
 * Create a new project
 * Requires authenticated user
 */
export async function createProject(name: string) {
  try {
    const session = await getSession();
    const userId = session?.userId || null;

    if (!userId) {
      return { data: null, error: new Error('Unauthorized - User not authenticated') };
    }

    const projectId = crypto.randomUUID();
    await query(
      `INSERT INTO projects (id, name, owner_id)
       VALUES (?, ?, ?)`,
      [projectId, name, userId]
    );

    const result = await query<Project>(
      `SELECT * FROM projects WHERE id = ?`,
      [projectId]
    );

    return { data: result.rows[0], error: null };
  } catch (error: any) {
    console.error('createProject error:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, name: string) {
  try {
    await query(
      `UPDATE projects
       SET name = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [name, id]
    );

    const result = await query<Project>(
      `SELECT * FROM projects WHERE id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('Project not found or already deleted') };
    }

    return { data: result.rows[0], error: null };
  } catch (error: any) {
    console.error('updateProject error:', error);
    return { data: null, error };
  }
}

/**
 * Soft delete a project
 * Sets deleted_at timestamp instead of actually deleting the row
 */
export async function deleteProject(id: string) {
  try {
    await query(
      `UPDATE projects
       SET deleted_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    const result = await query(
      `SELECT id FROM projects WHERE id = ? AND deleted_at IS NOT NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return { data: null, error: new Error('Project not found or already deleted') };
    }

    return { data: { id: result.rows[0].id }, error: null };
  } catch (error: any) {
    console.error('deleteProject error:', error);
    return { data: null, error };
  }
}
