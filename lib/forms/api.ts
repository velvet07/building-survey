/**
 * Forms Module - PostgreSQL Direct Connection
 * Űrlapok Modul - CRUD műveletek
 *
 * All form response data is stored in local PostgreSQL database.
 * Supabase is only used for authentication.
 */

import { query, getCurrentUserId } from '@/lib/db';
import type { FormValues, ProjectFormResponse } from './types';

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  const code = candidate.code?.toUpperCase();
  const message = candidate.message?.toLowerCase() ?? '';

  return (
    code === 'PGRST116' ||
    code === '42P01' ||
    message.includes('could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))
  );
}

const MISSING_TABLE_MESSAGE =
  'Az Aquapol űrlaphoz szükséges tárolótábla nem található. Kérjük futtasd a legfrissebb adatbázis migrációkat.';

/**
 * Get project form response
 * Projekt űrlap válasz lekérése
 */
export async function getProjectFormResponse(
  projectId: string,
  formSlug: string
): Promise<ProjectFormResponse | null> {
  try {
    const result = await query<ProjectFormResponse>(
      `SELECT * FROM public.project_form_responses
       WHERE project_id = $1 AND form_slug = $2`,
      [projectId, formSlug]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error: any) {
    if (isMissingTableError(error)) {
      console.warn('project_form_responses table is missing. Returning empty form.');
      return null;
    }

    console.error('Error fetching project form response:', error);
    throw new Error(
      `Űrlap betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}

/**
 * Save project form response (upsert)
 * Projekt űrlap válasz mentése (létrehozás vagy frissítés)
 */
export async function saveProjectFormResponse(
  projectId: string,
  formSlug: string,
  values: FormValues
): Promise<ProjectFormResponse> {
  try {
    // Get current authenticated user
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Felhasználó nem található - kérlek jelentkezz be újra');
    }

    // Check if response already exists
    const checkResult = await query<{ id: string }>(
      `SELECT id FROM public.project_form_responses
       WHERE project_id = $1 AND form_slug = $2`,
      [projectId, formSlug]
    );

    const submittedAt = new Date().toISOString();

    if (checkResult.rows.length > 0) {
      // Update existing response
      const existingId = checkResult.rows[0].id;
      const result = await query<ProjectFormResponse>(
        `UPDATE public.project_form_responses
         SET data = $1, updated_by = $2, submitted_at = $3
         WHERE id = $4
         RETURNING *`,
        [JSON.stringify(values), userId, submittedAt, existingId]
      );

      return result.rows[0];
    } else {
      // Insert new response
      const result = await query<ProjectFormResponse>(
        `INSERT INTO public.project_form_responses
         (project_id, form_slug, data, created_by, updated_by, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, formSlug, JSON.stringify(values), userId, userId, submittedAt]
      );

      return result.rows[0];
    }
  } catch (error: any) {
    if (isMissingTableError(error)) {
      console.error('project_form_responses table missing.');
      throw new Error(MISSING_TABLE_MESSAGE, { cause: error });
    }

    console.error('Error saving project form response:', error);
    throw new Error(
      `Űrlap mentése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}
