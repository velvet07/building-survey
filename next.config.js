/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Exclude canvas and konva from server-side bundling
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'konva', 'jsdom'];
    }
    return config;
  },
}

module.exports = nextConfig