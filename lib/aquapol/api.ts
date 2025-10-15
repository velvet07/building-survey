/**
 * Aquapol Form API
 * Supabase CRUD helpers for the Aquapol diagnostics form
 */

import { createClient } from '@/lib/supabase';
import type { AquapolFormData, AquapolFormRecord } from '@/types/aquapol.types';

/**
 * Fetch Aquapol form for a project
 */
export async function getAquapolForm(projectId: string): Promise<AquapolFormRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('aquapol_forms')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching Aquapol form:', error);
    throw new Error(`Aquapol űrlap betöltése sikertelen: ${error.message}`, { cause: error });
  }

  return data as AquapolFormRecord | null;
}

/**
 * Upsert Aquapol form for a project
 */
export async function saveAquapolForm(
  projectId: string,
  formData: AquapolFormData
): Promise<AquapolFormRecord> {
  const supabase = createClient();

  const payload = {
    project_id: projectId,
    data: formData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('aquapol_forms')
    .upsert(payload, { onConflict: 'project_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving Aquapol form:', error);
    throw new Error(`Aquapol űrlap mentése sikertelen: ${error.message}`, { cause: error });
  }

  return data as AquapolFormRecord;
}
