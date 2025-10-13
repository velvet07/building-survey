const SUPABASE_URL_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] as const;

const SUPABASE_ANON_KEY_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
] as const;

type SupabaseEnvKeys =
  | (typeof SUPABASE_URL_ENV_KEYS)[number]
  | (typeof SUPABASE_ANON_KEY_ENV_KEYS)[number];

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

declare global {
  interface Window {
    __SUPABASE_CONFIG__?: SupabaseConfig;
  }
}

function readProcessEnvValue(possibleKeys: readonly SupabaseEnvKeys[], label: string) {
  for (const key of possibleKeys) {
    const value = typeof process !== 'undefined' ? process.env?.[key as keyof NodeJS.ProcessEnv] : undefined;
    if (value) {
      if (
        typeof window === 'undefined' &&
        process.env.NODE_ENV !== 'production' &&
        !key.startsWith('NEXT_PUBLIC_')
      ) {
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

function readConfigFromProcessEnv(): SupabaseConfig {
  const url = readProcessEnvValue(SUPABASE_URL_ENV_KEYS, 'Supabase URL');
  const anonKey = readProcessEnvValue(SUPABASE_ANON_KEY_ENV_KEYS, 'Supabase anon kulcs');

  return { url, anonKey };
}

function readConfigFromWindow(): SupabaseConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const config = window.__SUPABASE_CONFIG__;
  if (config?.url && config?.anonKey) {
    return config;
  }

  return null;
}

export function getSupabaseServerConfig(): SupabaseConfig {
  return readConfigFromProcessEnv();
}

export function getSupabaseClientConfig(): SupabaseConfig {
  const browserConfig = readConfigFromWindow();
  if (browserConfig) {
    return browserConfig;
  }

  return readConfigFromProcessEnv();
}
