/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude canvas and konva from server-side bundling
      config.externals = [...(config.externals || []), 'canvas', 'konva', 'jsdom'];
    } else {
      // Exclude server-only modules from client-side bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'pg': false,
        'pg-native': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig