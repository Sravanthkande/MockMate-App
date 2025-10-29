/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 13+ and default in Next.js 15
  images: {
    remotePatterns: [], // Use remotePatterns instead of domains (deprecated)
  },
};

module.exports = nextConfig;
