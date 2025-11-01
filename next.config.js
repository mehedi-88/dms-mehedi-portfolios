/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to allow API routes to work
  // Use 'export' for static export, remove 'standalone' for compatibility
  // output: 'export', // ❌ REMOVED - conflicts with API routes

  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable API routes for static export
  trailingSlash: true,
};

module.exports = nextConfig;
