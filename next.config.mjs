/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx', 'md'],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
