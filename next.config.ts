// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Legacy URLs: /enough/uk/london/32000
        source: "/enough/:country/:city/:salary",
        // New canonical form: /enough/uk/london?salary=32000
        destination: "/enough/:country/:city?salary=:salary",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
