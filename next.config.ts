import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow build to complete with ESLint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
