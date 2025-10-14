import { createClient } from './supabase';

export async function getProjects() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getProjectById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  return { data, error };
}

export async function createProject(name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: new Error('Unauthorized') };

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  return { data, error };
}

export async function updateProject(id: string, name: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProject(id: string) {
  const supabase = createClient();

  // Use the database function which has SECURITY DEFINER
  // This bypasses RLS policies
  const { error } = await supabase.rpc('soft_delete_project', {
    project_id: id
  });

  if (error) {
    console.error('Delete RPC error:', error);
    return { data: null, error };
  }

  return { data: { id }, error: null };
}