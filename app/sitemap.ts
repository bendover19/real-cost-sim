// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://real-cost-sim.vercel.app";

  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      priority: 1.0,
    },
    {
      url: `${base}/sim`,
      lastModified: now,
      priority: 0.9,
    },

    // === SEO landing pages (update slugs if you renamed any) ===
    { url: `${base}/real-hourly-wage-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/true-cost-of-commuting-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/remote-work-salary-comparison`, lastModified: now, priority: 0.8 },
    { url: `${base}/moving-city-cost-of-living-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/salary-vs-rent-ratio-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/debt-and-lifestyle-burn-rate`, lastModified: now, priority: 0.8 },
    { url: `${base}/single-parent-cost-of-working-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/couples-cost-of-working-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/digital-nomad-real-earnings-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/uk-vs-eu-vs-us-salary-comparison`, lastModified: now, priority: 0.8 },

    // Legal
    { url: `${base}/privacy`, lastModified: now, priority: 0.2 },
  ];
}
