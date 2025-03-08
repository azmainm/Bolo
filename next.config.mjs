/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost','https://bolo-abar.vercel.app/'], // Add your production domain later
  },
  // Remove webpack config unless you're actually using web workers
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;