/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@smart-finance/shared', '@smart-finance/validation'],
};

export default nextConfig;

