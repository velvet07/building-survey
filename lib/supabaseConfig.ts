const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    '[supabase-config] Hiányzik a Supabase URL. Állítsd be a NEXT_PUBLIC_SUPABASE_URL környezeti változót a Netlify felületén.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    '[supabase-config] Hiányzik a Supabase anon kulcs. Állítsd be a NEXT_PUBLIC_SUPABASE_ANON_KEY környezeti változót a Netlify felületén.'
  );
}

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const sharedConfig: SupabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};

export function getSupabaseClientConfig(): SupabaseConfig {
  return sharedConfig;
}

export function getSupabaseServerConfig(): SupabaseConfig {
  return sharedConfig;
}
