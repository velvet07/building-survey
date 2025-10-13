const sanitize = (value, key) => {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed !== value) {
    console.warn(
      `[supabase-env] A(z) ${key} változó körülbelül szóközöket tartalmazott, ezeket automatikusan eltávolítottuk.`
    );
  }

  return trimmed;
};

const resolveEnvValue = (primaryKey, fallbackKeys = []) => {
  const directValue = sanitize(process.env[primaryKey], primaryKey);
  if (directValue) {
    process.env[primaryKey] = directValue;
    return directValue;
  }

  for (const key of fallbackKeys) {
    const value = sanitize(process.env[key], key);
    if (value) {
      console.warn(
        `[supabase-env] A(z) ${primaryKey} nincs beállítva. A rendszer a(z) ${key} értékét fogja használni. ` +
          'Állítsd be a NEXT_PUBLIC_* változókat a biztonságos kliens-oldali eléréshez.'
      );
      process.env[primaryKey] = value;
      return value;
    }
  }

  return undefined;
};

const supabaseUrl = resolveEnvValue('NEXT_PUBLIC_SUPABASE_URL', ['SUPABASE_URL']);
const supabaseAnonKey = resolveEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', [
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
]);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase-env] Hiányoznak a Supabase környezeti változók. Ellenőrizd a Netlify beállításokat: NEXT_PUBLIC_SUPABASE_URL és NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  webpack: (config, { isServer }) => {
    // Exclude canvas and konva from server-side bundling
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'konva', 'jsdom'];
    }
    return config;
  },
};

module.exports = nextConfig;
