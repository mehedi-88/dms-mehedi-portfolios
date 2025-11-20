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

// Optional: Warn if not using npm for build
if (process.env.npm_execpath && !process.env.npm_execpath.includes('npm-cli.js')) {
  console.warn('\u001b[33m[WARNING] It is recommended to use npm (not pnpm/yarn) for building this project.\u001b[0m');
}

module.exports = nextConfig;
