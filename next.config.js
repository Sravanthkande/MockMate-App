/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the App Router officially introduced in Next.js 13
  experimental: {
    appDir: true,
  },
  // Allows you to use images from specific external domains (if needed)
  images: {
    domains: [], 
  },
};

module.exports = nextConfig;
