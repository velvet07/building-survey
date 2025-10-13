const resolveEnvValue = (primaryKey, fallbackKeys = []) => {
  const keys = [primaryKey, ...fallbackKeys];

  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      if (key !== primaryKey) {
        console.warn(
          `[supabase-env] A(z) ${primaryKey} nincs beállítva. A rendszer a(z) ${key} értékét fogja használni. ` +
            'Állítsd be a NEXT_PUBLIC_* változókat a biztonságos kliens-oldali eléréshez.'
        );
      }
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
