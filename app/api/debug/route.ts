import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({
      authenticated: false,
      error: userError?.message || 'No user',
    });
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Try to create a test project
  const { data: testProject, error: createError } = await supabase
    .from('projects')
    .insert({ name: 'Test Project ' + Date.now(), owner_id: user.id })
    .select()
    .single();

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    profileError: profileError?.message,
    testProject,
    createError: createError?.message,
  });
}