/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: 'noofoxxx.local', pathname: '/**' },
      { protocol: 'http', hostname: 'noofoxxx.local', pathname: '/**' },
    ],
  },
};

export default nextConfig;
