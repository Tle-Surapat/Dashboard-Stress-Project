/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Allow build to continue despite ESLint errors/warnings
  },
};

export default nextConfig;
