import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["https://aij.lat"],
      bodySizeLimit: "1100mb",
    },
  },
  // Ensure the server listens on all network interfaces in production
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone'
  })
};

export default nextConfig;
