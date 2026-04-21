/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@trashflow/ui', '@trashflow/db', '@tremor/react'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
