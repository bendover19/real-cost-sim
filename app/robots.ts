// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://real-cost-sim.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/", // allow everything
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
