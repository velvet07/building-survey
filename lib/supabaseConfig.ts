const SUPABASE_URL_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
] as const;

const SUPABASE_ANON_KEY_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
] as const;

const ENV_SOURCE: Record<
  (typeof SUPABASE_URL_ENV_KEYS)[number] | (typeof SUPABASE_ANON_KEY_ENV_KEYS)[number],
  string | undefined
> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
};

function readEnvValue<K extends keyof typeof ENV_SOURCE>(possibleKeys: readonly K[], label: string) {
  for (const key of possibleKeys) {
    const value = ENV_SOURCE[key];
    if (value) {
      if (process.env.NODE_ENV !== 'production' && !key.startsWith('NEXT_PUBLIC_')) {
        console.warn(
          `[supabase-config] A(z) ${label} a ${key} változóból lett kiolvasva. ` +
            'Javasolt átnevezni NEXT_PUBLIC_* előtagra a kliens oldali használathoz.'
        );
      }

      return value;
    }
  }

  throw new Error(
    `[supabase-config] Hiányzik a(z) ${label}. Állítsd be a következő változók valamelyikét: ${possibleKeys
      .map((key) => `\`${key}\``)
      .join(', ')}.`
  );
}

export function getSupabaseClientConfig() {
  const url = readEnvValue(SUPABASE_URL_ENV_KEYS, 'Supabase URL');
  const anonKey = readEnvValue(SUPABASE_ANON_KEY_ENV_KEYS, 'Supabase anon kulcs');

  return { url, anonKey };
}
