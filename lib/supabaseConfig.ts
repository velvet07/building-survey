export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

let cachedConfig: SupabaseConfig | null = null;

const normalize = (value: string | undefined, key: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[supabase-config] A(z) ${key} értéke ('${value}') érvénytelennek tűnik, figyelmen kívül hagyjuk.`
      );
    }
    return undefined;
  }

  return trimmed;
};

const resolveSupabaseConfig = (): SupabaseConfig => {
  const urlResult = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const anonKeyResult = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

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

