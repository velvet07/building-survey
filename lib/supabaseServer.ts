import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getSupabaseServerConfig } from './supabaseConfig';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const { url, anonKey } = getSupabaseServerConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}