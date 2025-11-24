import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensures Next NEVER tries to statically export /enough or freeze searchParams
  output: undefined,
  experimental: {
    serverActions: false,
  },

  // Optional but safe: prevents accidental static caching
  reactStrictMode: true,
};

export default nextConfig;
