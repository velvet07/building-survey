const sanitize = (value: string | undefined, key: string) => {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed !== value) {
    console.warn(
      `[supabase-config] A(z) ${key} értékében találtunk fölös szóközöket, ezeket eltávolítottuk a Supabase klienshez.`
    );
  }

  return trimmed;
};

const resolveEnvValue = (primaryKey: string, fallbackKeys: string[]) => {
  const direct = sanitize(process.env[primaryKey], primaryKey);
  if (direct) {
    return { value: direct, source: primaryKey } as const;
  }

  for (const key of fallbackKeys) {
    const fallback = sanitize(process.env[key], key);
    if (fallback) {
      console.warn(
        `[supabase-config] A(z) ${primaryKey} nincs beállítva. A(z) ${key} értékét használjuk helyette.`
      );
      process.env[primaryKey] = fallback;
      return { value: fallback, source: key } as const;
    }
  }

  return { value: undefined, source: undefined } as const;
};

const { value: supabaseUrl } = resolveEnvValue('NEXT_PUBLIC_SUPABASE_URL', ['SUPABASE_URL']);
const { value: supabaseAnonKey } = resolveEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', [
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
]);

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
