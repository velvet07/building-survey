import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({
      error: 'Not authenticated',
      details: userError?.message,
    }, { status: 401 });
  }

  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Check triggers existence
  const { data: triggers, error: triggersError } = await supabase
    .rpc('get_triggers_info' as any);

  // Try to get detailed error when creating project
  const { data: testProject, error: createError } = await supabase
    .from('projects')
    .insert({
      name: 'Debug Test Project ' + Date.now(),
      owner_id: user.id
    })
    .select()
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile || null,
    profileError: profileError ? {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    } : null,
    testProject: testProject || null,
    createError: createError ? {
      message: createError.message,
      code: createError.code,
      details: createError.details,
      hint: createError.hint,
    } : null,
    diagnosis: !profile
      ? 'HIBA: Nincs profile bejegyzés! A handle_new_user() trigger nem lett deployolva vagy nem működik.'
      : !testProject && createError?.code === '23505'
      ? 'HIBA: Unique constraint violation - valószínűleg auto_identifier duplikáció'
      : !testProject && createError?.code === '42501'
      ? 'HIBA: RLS policy tiltja a create műveletet - ellenőrizd a role-t'
      : testProject
      ? 'OK: Minden működik, projekt sikeresen létrehozva!'
      : `HIBA: ${createError?.code} - ${createError?.message}`,
  });
}