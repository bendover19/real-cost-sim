// app/enough/[country]/[city]/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../EnoughClient";
import { UK_CITIES, generateCityDescription } from "../../../cityConfig";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

// --- Metadata: try to get the real city, else fall back safely ---
export function generateMetadata({ params }: Props): Metadata {
  const rawCountry = params.country ?? "uk";
  const rawCity = params.city ?? "london";

  const country =
    typeof rawCountry === "string" ? rawCountry.toLowerCase() : "uk";
  const citySlug =
    typeof rawCity === "string" ? rawCity.toLowerCase() : "london";

  const city = UK_CITIES.find((c) => c.slug === citySlug) || null;

  const cityLabel = city
    ? city.label
    : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const canonicalBase =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-cost-sim.com";
  const canonical = `${canonicalBase}/enough/${country}/${citySlug}`;

  const description = city
    ? generateCityDescription(city)
    : `Rough estimate of what's left after rent, bills and commute for a single renter in ${cityLabel}.`;

  return {
    title: `Is this salary enough to live in ${cityLabel}? | Real Cost Sim`,
    description,
    alternates: {
      canonical,
    },
  };
}

// --- Page: just render the client calculator like before ---
export default function EnoughCityPage() {
  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        <EnoughClient />
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </Suspense>
    </main>
  );
}
