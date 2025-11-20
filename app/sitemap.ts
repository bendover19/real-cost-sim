// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://real-cost-sim.vercel.app";
  const now = new Date();

  return [
    // Core
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

    // === Calculator / landing pages (current folder names) ===
    { url: `${base}/real-hourly-wage-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/commute-cost-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/cost-of-working-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/move-city-cost-of-living-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/part-time-vs-full-time-hourly-pay`, lastModified: now, priority: 0.8 },
    { url: `${base}/remote-vs-office-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/remote-work-savings-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/two-jobs-burnout-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/uk-cost-of-working-calculator`, lastModified: now, priority: 0.8 },
    { url: `${base}/us-cost-of-working-calculator`, lastModified: now, priority: 0.8 },

    // Content / side pages (lower priority)
    { url: `${base}/reddit`, lastModified: now, priority: 0.4 },
    { url: `${base}/tiktok`, lastModified: now, priority: 0.4 },

    // Legal
    { url: `${base}/privacy`, lastModified: now, priority: 0.2 },
  ];
}
