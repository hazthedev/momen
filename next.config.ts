/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use custom loader for R2 images
    loader: 'custom',
    loaderFile: './lib/storage/image-loader.ts',
    // Remote patterns for R2 and other sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features for Next.js 15
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Environment variables available to the browser
  env: {
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes for packages that depend on Node.js built-ins
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
