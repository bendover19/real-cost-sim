// next.config.ts
import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        // pretty URL:  /enough/uk/london/28000
        source: "/enough/:country/:city/:salary",
        // internal URL: /enough?country=uk&city=london&salary=28000
        destination: "/enough?country=:country&city=:city&salary=:salary",
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
