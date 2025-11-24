'use server';

/**
 * Server Actions for Form Responses
 *
 * Uses local MySQL/MariaDB database via lib/forms/api.ts
 */

import { revalidatePath } from 'next/cache';
import {
  getProjectFormResponse as getFormResponse,
  saveProjectFormResponse as saveFormResponse,
} from '@/lib/forms/api';
import type { FormValues, ProjectFormResponse } from '@/lib/forms/types';

/**
 * Get project form response
 */
export async function getProjectFormResponseAction(
  projectId: string,
  formSlug: string
): Promise<{ data: ProjectFormResponse | null; error: Error | null }> {
  try {
    const data = await getFormResponse(projectId, formSlug);
    return { data, error: null };
  } catch (error) {
    console.error('Error in getProjectFormResponseAction:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Save project form response
 */
export async function saveProjectFormResponseAction(
  projectId: string,
  formSlug: string,
  values: FormValues
): Promise<{ data: ProjectFormResponse | null; error: Error | null }> {
  try {
    const data = await saveFormResponse(projectId, formSlug, values);

    // Revalidate the project page and forms page
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/dashboard/projects/${projectId}/forms/${formSlug}`);

    return { data, error: null };
  } catch (error) {
    console.error('Error in saveProjectFormResponseAction:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
