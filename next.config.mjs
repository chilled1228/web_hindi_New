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
  webpack: (config) => {
    // This is needed for module resolution
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig; 