// app/sitemap.ts
import type { MetadataRoute } from "next";
import { UK_CITIES } from "./cityConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.real-cost-sim.com";

  // Group-level meaningful update dates
  const CORE_CALCULATORS_UPDATED = "2025-12-11";
  const CITY_PAGES_UPDATED = "2025-12-20";
  const STATIC_PAGES_UPDATED = "2025-12-18";
  const LEGAL_PAGES_UPDATED = "2025-11-10";

  const staticUrls: MetadataRoute.Sitemap = [
    // Core / hubs
    { url: `${base}/`, lastModified: STATIC_PAGES_UPDATED },
    { url: `${base}/enough`, lastModified: STATIC_PAGES_UPDATED },

    // Calculator pages (updated ~1 month ago)
    { url: `${base}/real-hourly-wage-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/commute-cost-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/cost-of-working-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/move-city-cost-of-living-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/part-time-vs-full-time-hourly-pay`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/remote-vs-office-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/remote-work-savings-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/two-jobs-burnout-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/uk-cost-of-working-calculator`, lastModified: CORE_CALCULATORS_UPDATED },
    { url: `${base}/us-cost-of-working-calculator`, lastModified: CORE_CALCULATORS_UPDATED },

    // Side content (recent tweaks)
    //{ url: `${base}/reddit`, lastModified: STATIC_PAGES_UPDATED },
    //{ url: `${base}/tiktok`, lastModified: STATIC_PAGES_UPDATED },

    // Legal
    { url: `${base}/privacy`, lastModified: LEGAL_PAGES_UPDATED },
  ];

  // City-level "Is this salary enough?" pages
  const enoughCityUrls: MetadataRoute.Sitemap = UK_CITIES.map((city) => ({
    url: `${base}/enough/uk/${city.slug}/`,
    lastModified: CITY_PAGES_UPDATED,
  }));

  return [...staticUrls, ...enoughCityUrls];
}
