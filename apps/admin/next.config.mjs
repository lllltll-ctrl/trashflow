/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@trashflow/ui', '@trashflow/db', '@tremor/react'],
  // Lint runs as a separate CI job / local `pnpm lint` — don't couple it to build.
  eslint: { ignoreDuringBuilds: true },
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
