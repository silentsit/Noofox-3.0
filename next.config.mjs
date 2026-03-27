/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: 'noofoxxx.local', pathname: '/**' },
      { protocol: 'http', hostname: 'noofoxxx.local', pathname: '/**' },
      { protocol: 'https', hostname: 'whalefriend-shop.lovable.app', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/category/modafinil',
        destination: '/modafinil',
        permanent: true,
      },
      {
        source: '/category/armodafinil',
        destination: '/armodafinil',
        permanent: true,
      },
      // Legacy WP paths referenced from footer / external links
      { source: '/return-policy', destination: '/terms', permanent: true },
      { source: '/noofox-reviews', destination: '/about', permanent: true },
      {
        source: '/buy-modafinil-online',
        destination: '/modafinil',
        permanent: true,
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    // Windows: persistent webpack filesystem cache can desync across HMR/rebuilds or
    // concurrent dev servers, yielding missing chunk errors and *unstyled* pages that
    // look like "layout broke". Disable persistent cache entirely (dev + `next build`).
    // Trade-off: slower cold builds; reliability on Windows is worth it here.
    config.cache = false;
    return config;
  },
};

export default nextConfig;
