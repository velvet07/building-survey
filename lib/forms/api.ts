import { createClient } from '@/lib/supabase';
import type { FormValues, ProjectFormResponse } from './types';

export async function getProjectFormResponse(
  projectId: string,
  formSlug: string
): Promise<ProjectFormResponse | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('project_form_responses')
    .select('*')
    .eq('project_id', projectId)
    .eq('form_slug', formSlug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching project form response:', error);
    throw new Error(
      `Űrlap betöltése sikertelen: ${error.message}`,
      { cause: error }
    );
  }

  return data as ProjectFormResponse | null;
}

export async function saveProjectFormResponse(
  projectId: string,
  formSlug: string,
  values: FormValues
): Promise<ProjectFormResponse> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Auth error while saving form:', authError);
    throw new Error(
      `Autentikációs hiba: ${authError.message}`,
      { cause: authError }
    );
  }

  if (!user) {
    throw new Error('Felhasználó nem található. Jelentkezz be újra.');
  }

  const { data: existing, error: fetchError } = await supabase
    .from('project_form_responses')
    .select('id')
    .eq('project_id', projectId)
    .eq('form_slug', formSlug)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing form response:', fetchError);
    throw new Error(
      `Űrlap ellenőrzése sikertelen: ${fetchError.message}`,
      { cause: fetchError }
    );
  }

  if (existing) {
    const { data, error } = await supabase
      .from('project_form_responses')
      .update({
        data: values,
        updated_by: user.id,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project form response:', error);
      throw new Error(
        `Űrlap mentése sikertelen: ${error.message}`,
        { cause: error }
      );
    }

    return data as ProjectFormResponse;
  }

  const { data, error } = await supabase
    .from('project_form_responses')
    .insert({
      project_id: projectId,
      form_slug: formSlug,
      data: values,
      created_by: user.id,
      updated_by: user.id,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project form response:', error);
    throw new Error(
      `Űrlap létrehozása sikertelen: ${error.message}`,
      { cause: error }
    );
  }

  return data as ProjectFormResponse;
}
