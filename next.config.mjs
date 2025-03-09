/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    // This is needed for module resolution
    config.resolve.fallback = { fs: false, path: false };
    
    // Add additional module resolution paths
    config.resolve.modules = [
      ...config.resolve.modules,
      './node_modules/.next-build-modules',
      '.',
    ];
    
    return config;
  },
};

export default nextConfig; 