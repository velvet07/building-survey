const SUPABASE_URL_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
];

const SUPABASE_ANON_KEY_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
];

function readEnvValue(possibleKeys: string[], label: string) {
  for (const key of possibleKeys) {
    const value = process.env[key];
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
