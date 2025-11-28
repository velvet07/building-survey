/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CWP7 deployment - no standalone output needed
  // output: 'standalone', // Disabled for CWP7
  webpack: (config, { isServer }) => {
    // Exclude canvas and konva from server-side bundling
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'canvas',
        'konva',
        'jsdom',
        // PostgreSQL library and its dependencies (server-side only)
        'pg',
        'pg-native',
        'pg-hstore',
      ];
    }

    // Fallback for Node.js built-in modules that pg uses
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
    };

    return config;
  },
}

module.exports = nextConfig

