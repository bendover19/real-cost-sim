// app/sitemap.ts
import type { MetadataRoute } from "next";
import { UK_CITIES } from "./cityConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.real-cost-sim.com";

  // Use a simple YYYY-MM-DD string (safe for XML sitemaps)
  const today = new Date().toISOString().split("T")[0];

  const staticUrls: MetadataRoute.Sitemap = [
    // Core
    {
      url: `${base}/`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/enough`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Calculator / landing pages
    {
      url: `${base}/real-hourly-wage-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/commute-cost-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/cost-of-working-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/move-city-cost-of-living-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/part-time-vs-full-time-hourly-pay`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/remote-vs-office-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/remote-work-savings-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/two-jobs-burnout-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/uk-cost-of-working-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/us-cost-of-working-calculator`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Content / side pages
    {
      url: `${base}/reddit`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/tiktok`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // Legal
    {
      url: `${base}/privacy`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Programmatic "Is this salary enough in CITY?" pages
  const enoughCityUrls: MetadataRoute.Sitemap = UK_CITIES.map((city) => ({
    url: `${base}/enough/uk/${city.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticUrls, ...enoughCityUrls];
}
