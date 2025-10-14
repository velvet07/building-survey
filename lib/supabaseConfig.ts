export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

let cachedConfig: SupabaseConfig | null = null;

const resolveSupabaseConfig = (): SupabaseConfig => {
  const urlResult = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKeyResult = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!urlResult) {
    throw new Error(
      '[supabase-config] Hiányzik a Supabase URL. Állítsd be a NEXT_PUBLIC_SUPABASE_URL környezeti változót a Netlify felületén.'
    );
  }

  if (!anonKeyResult) {
    throw new Error(
      '[supabase-config] Hiányzik a Supabase anon kulcs. Állítsd be a NEXT_PUBLIC_SUPABASE_ANON_KEY környezeti változót a Netlify felületén.'
    );
  }

  return {
    url: urlResult,
    anonKey: anonKeyResult,
  };
};

export function getSupabaseClientConfig(): SupabaseConfig {
  if (!cachedConfig) {
    cachedConfig = resolveSupabaseConfig();
  }

  return cachedConfig;
}

export function getSupabaseServerConfig(): SupabaseConfig {
  if (!cachedConfig) {
    cachedConfig = resolveSupabaseConfig();
  }

  return cachedConfig;
}

