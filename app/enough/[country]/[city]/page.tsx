// app/enough/[country]/[city]/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import EnoughClient from "../../EnoughClient";
import { UK_CITIES, generateCityDescription } from "../../../cityConfig";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

export const dynamic = "force-dynamic";

/**
 * Helper to extract /enough/<country>/<city> from the request path
 */
function getSlugsFromPath(fallbackCountry = "uk") {
  const h = headers();

  // Try a few header options that can contain the path
  const rawPath =
    h.get("x-invoke-path") || h.get("next-url") || h.get("referer") || "";

  // We only care about the path portion (strip protocol, domain, query)
  let path = rawPath;

  try {
    // If it's a full URL, parse it
    if (rawPath.startsWith("http")) {
      path = new URL(rawPath).pathname;
    }
  } catch {
    // ignore parse failure, stick with rawPath
  }

  const segments = path.split("?")[0].split("/").filter(Boolean); // e.g. ["enough","uk","southampton"]
  const idx = segments.indexOf("enough");

  let countrySlug = fallbackCountry.toLowerCase();
  let citySlug = "";

  if (idx !== -1 && segments.length >= idx + 3) {
    countrySlug = segments[idx + 1].toLowerCase();
    citySlug = segments[idx + 2].toLowerCase();
  }

  return { countrySlug, citySlug, rawPath, path, segments };
}

// ----------------------
// Metadata
// ----------------------
export function generateMetadata({ params }: Props): Metadata {
  // Try params first
  let countrySlug = (params.country || "uk").toLowerCase();
  let citySlug = (params.city || "").toLowerCase();

  // If params are missing, derive from path
  if (!citySlug) {
    const fromPath = getSlugsFromPath(countrySlug);
    countrySlug = fromPath.countrySlug;
    citySlug = fromPath.citySlug;
  }

  const city = UK_CITIES.find((c) => c.slug === citySlug) || null;

  const cityLabel = city
    ? city.label
    : citySlug
    ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
    : "this city";

  const canonicalBase =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-cost-sim.com";
  const canonical = `${canonicalBase}/enough/${countrySlug}/${citySlug}`;

  return {
    title: `Is this salary enough to live in ${cityLabel}? | Real Cost Sim`,
    description: `Rough estimate of rent, bills, commute and leftover salary for living in ${cityLabel}.`,
    alternates: { canonical },
  };
}

// ----------------------
// Page component
// ----------------------
export default function EnoughCityPage({ params }: Props) {
  // Try params first
  let countrySlug = (params.country || "uk").toLowerCase();
  let citySlug = (params.city || "").toLowerCase();

  // If missing, derive from path
  let debugInfo: any = { params };

  if (!citySlug) {
    const fromPath = getSlugsFromPath(countrySlug);
    countrySlug = fromPath.countrySlug;
    citySlug = fromPath.citySlug;
    debugInfo = { ...debugInfo, fromPath };
  }

  const city = UK_CITIES.find((c) => c.slug === citySlug) || null;

  const cityLabel = city
    ? city.label
    : citySlug
    ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
    : "this city";

  const description = city ? generateCityDescription(city) : "";

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      {/* Server-rendered SEO block */}
      <section className="w-full max-w-3xl mb-10">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-4">
          Is this salary enough to live in {cityLabel}?
        </h1>

        {description && (
          <p className="text-[14px] text-zinc-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}
      </section>

      {/* Client-side simulator */}
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        <EnoughClient serverCity={citySlug} serverCountry={countrySlug} />
      </Suspense>

      {/* Debug info – REMOVE WHEN DONE */}
      <pre className="mt-16 p-4 bg-black text-green-400 text-xs rounded-xl w-full max-w-3xl overflow-auto">
        {JSON.stringify(
          {
            debugInfo,
            computed: { countrySlug, citySlug },
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
