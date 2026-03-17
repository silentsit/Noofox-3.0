/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'whalefriend-shop.lovable.app',
        pathname: '/lovable-uploads/**',
      },
    ],
  },
}

export default nextConfig
