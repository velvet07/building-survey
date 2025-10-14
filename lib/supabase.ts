import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

import { getSupabaseClientConfig, getSupabaseServerConfig } from './supabaseConfig';

export function createClient() {
  const { url, anonKey } = getSupabaseClientConfig();

  return createBrowserClient(url, anonKey, {
    global: {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    },
  });
}

export function createServerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  const { url, anonKey } = getSupabaseServerConfig();

  return createServerClient(url, anonKey, {
    global: {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component limitation
        }
      },
    },
  });
}