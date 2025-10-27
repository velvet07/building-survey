/**
 * Projects Module - PostgreSQL Direct Connection
 *
 * All project data is stored in local PostgreSQL database.
 * Supabase is only used for authentication.
 */

import { query, getCurrentUserId } from './db';
import { ProjectStatus } from '@/types/project.types';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
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
      `SELECT * FROM public.projects
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
      `SELECT * FROM public.projects
       WHERE id = $1 AND deleted_at IS NULL`,
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
export async function createProject(name: string, status: ProjectStatus = 'active') {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: new Error('Unauthorized - User not authenticated') };
    }

    const result = await query<Project>(
      `INSERT INTO public.projects (name, owner_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, userId, status]
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
export async function updateProject(id: string, name: string, status?: ProjectStatus) {
  try {
    let queryText: string;
    let params: any[];

    if (status) {
      queryText = `UPDATE public.projects
                   SET name = $1, status = $2, updated_at = NOW()
                   WHERE id = $3 AND deleted_at IS NULL
                   RETURNING *`;
      params = [name, status, id];
    } else {
      queryText = `UPDATE public.projects
                   SET name = $1, updated_at = NOW()
                   WHERE id = $2 AND deleted_at IS NULL
                   RETURNING *`;
      params = [name, id];
    }

    const result = await query<Project>(queryText, params);

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
    const result = await query(
      `UPDATE public.projects
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
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
