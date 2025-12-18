import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "@app/EnoughClient";
import { UK_CITIES, generateCityDescription } from "@app/cityConfig";



type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

const BASE_URL = "https://www.real-cost-sim.com";

export function generateMetadata({ params }: Props): Metadata {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = (params.city ?? "london").toLowerCase();

  const city = UK_CITIES.find((c) => c.slug === citySlug);
  const cityLabel =
    city?.label ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const title = `Is your salary enough to live in ${cityLabel}? | Real Cost Simulator`;

  // short, city-specific meta description
  const description =
    city
      ? generateCityDescription(city).slice(0, 155)
      : `Rough breakdown of rent, bills, commute and leftovers for single renters in ${cityLabel}.`;

  const canonical = `${BASE_URL}/enough/${country}/${citySlug}/`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function EnoughCityPage({ params }: Props) {
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
      </Suspense>
    </main>
  );
}
