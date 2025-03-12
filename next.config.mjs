/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // Required for Cloudflare Pages
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    // Enable partial prerendering for faster initial page loads
    ppr: true,
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
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Improve production build output
  swcMinify: true,
  // Configure compression
  compress: true,
  // Increase timeout for large builds
  staticPageGenerationTimeout: 120,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Configure trailing slashes
  trailingSlash: false,
  // Configure Cloudflare specific settings
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://nayabharatyojana.in',
  }
};

export default nextConfig; 