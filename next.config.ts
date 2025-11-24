import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/enough/:country/:city/:salary",
        destination: "/enough?country=:country&city=:city&salary=:salary",
      },
    ];
  },
};

export default nextConfig;
