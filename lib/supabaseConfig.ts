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

type RuntimeConfig = Record<string, string | undefined> | undefined;

const getRuntimeConfig = (): RuntimeConfig => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const runtimeConfig = (globalThis as unknown as { __SUPABASE_RUNTIME_CONFIG__?: RuntimeConfig })
    .__SUPABASE_RUNTIME_CONFIG__;

  if (!runtimeConfig || typeof runtimeConfig !== 'object') {
    return undefined;
  }

  return runtimeConfig;
};

const readRuntimeValue = (key: string) => {
  const runtime = getRuntimeConfig();
  if (!runtime) {
    return undefined;
  }

  const value = runtime[key];
  return typeof value === 'string' ? value : undefined;
};

const readProcessEnv = (key: string) => {
  if (typeof process === 'undefined' || !process?.env) {
    return undefined;
  }

  return process.env[key];
};

const logFallback = (missingKey: string, usedKey: string) => {
  console.warn(
    `[supabase-config] A ${missingKey} nincs beállítva. A(z) ${usedKey} értékét használjuk helyette.`
  );
};

const resolveValue = (primaryKey: string, fallbackKeys: string[]) => {
  const primary = sanitize(readProcessEnv(primaryKey), primaryKey) ?? sanitize(readRuntimeValue(primaryKey), primaryKey);
  if (primary) {
    return primary;
  }

  for (const key of fallbackKeys) {
    const candidate =
      sanitize(readProcessEnv(key), key) ?? sanitize(readRuntimeValue(key), `${key} (runtime)`);
    if (candidate) {
      logFallback(primaryKey, key);
      return candidate;
    }
  }

  return undefined;
};

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

let cachedConfig: SupabaseConfig | null = null;

const resolveSupabaseConfig = (): SupabaseConfig => {
  const urlResult = resolveValue('NEXT_PUBLIC_SUPABASE_URL', ['SUPABASE_URL']);
  const anonKeyResult = resolveValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', [
    'SUPABASE_ANON_KEY',
    'SUPABASE_KEY',
  ]);

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

