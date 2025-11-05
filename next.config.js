/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone build for Docker

  // Explicitly mark pg as external package for server components
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-native'],
  },

  webpack: (config, { isServer }) => {
    // Exclude canvas and konva from server-side bundling
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'konva', 'jsdom'];
    }

    // Exclude PostgreSQL and related modules from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'pg-native': false,
      };

      config.externals = [
        ...(config.externals || []),
        'pg',
        'pg-native',
        'pg-hstore',
      ];

      // Explicitly prevent importing server-only modules
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/db': false,
        'pg': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig