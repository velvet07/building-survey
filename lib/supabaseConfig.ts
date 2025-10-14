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

const readProcessEnv = (key: string) => {
  if (typeof process === 'undefined' || !process?.env) {
    return undefined;
  }

  return process.env[key];
};

const assignProcessEnv = (key: string, value: string) => {
  if (typeof process === 'undefined' || !process?.env) {
    return;
  }

  process.env[key] = value;
};

let supabaseUrl = sanitize(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_URL'
);

if (!supabaseUrl) {
  const fallbackUrl = sanitize(readProcessEnv('SUPABASE_URL'), 'SUPABASE_URL');
  if (fallbackUrl) {
    console.warn(
      `[supabase-config] A NEXT_PUBLIC_SUPABASE_URL nincs beállítva. A SUPABASE_URL értékét használjuk helyette.`
    );
    assignProcessEnv('NEXT_PUBLIC_SUPABASE_URL', fallbackUrl);
    supabaseUrl = fallbackUrl;
  }
}

let supabaseAnonKey = sanitize(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
);

if (!supabaseAnonKey) {
  const anonKeyFallback = sanitize(readProcessEnv('SUPABASE_ANON_KEY'), 'SUPABASE_ANON_KEY');
  let fallbackSource: 'SUPABASE_ANON_KEY' | 'SUPABASE_KEY' | null = null;
  let resolvedFallback = anonKeyFallback;

  if (!resolvedFallback) {
    const keyFallback = sanitize(readProcessEnv('SUPABASE_KEY'), 'SUPABASE_KEY');
    if (keyFallback) {
      resolvedFallback = keyFallback;
      fallbackSource = 'SUPABASE_KEY';
    }
  } else {
    fallbackSource = 'SUPABASE_ANON_KEY';
  }

  if (resolvedFallback) {
    const sourceLabel = fallbackSource ?? 'ismeretlen forrás';
    console.warn(
      `[supabase-config] A NEXT_PUBLIC_SUPABASE_ANON_KEY nincs beállítva. A ${sourceLabel} értékét használjuk helyette.`
    );
    assignProcessEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', resolvedFallback);
    supabaseAnonKey = resolvedFallback;
  }
}

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
