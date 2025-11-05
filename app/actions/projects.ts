'use server';

import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(name: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Unauthorized') };
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/projects');
  }

  return { data, error };
}

export async function updateProjectAction(id: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data, error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard/projects');
  }

  return { data, error };
}

export async function deleteProjectAction(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { error } = await supabase.rpc('soft_delete_project', {
    project_id: id
  });

  if (error) {
    console.error('Delete RPC error:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/projects');
  return { data: { id }, error: null };
}

export async function getProjectsAction() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return { data, error };
}