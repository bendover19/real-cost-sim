import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "@app/enough/EnoughClient";
import { UK_CITIES, generateCityDescription } from "@app/cityConfig";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

const BASE_URL = "https://www.real-cost-sim.com";

export async function generateStaticParams() {
  return UK_CITIES.map((city) => ({
    country: "uk",
    city: city.slug,
  }));
}

function labelFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function generateMetadata({ params }: Props): Metadata {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = params.city?.toLowerCase();

  if (!citySlug) {
    return {
      title: "Is this salary enough? | Real Cost Simulator",
      description:
        "Check whether your salary is enough after rent, bills and commuting in major UK cities.",
      alternates: { canonical: `${BASE_URL}/enough` },
      robots: { index: true, follow: true },
    };
  }

  const city = UK_CITIES.find((c) => c.slug === citySlug);
  const cityLabel = city ? city.label : labelFromSlug(citySlug);

  const title = `Is your salary enough to live in ${cityLabel}? | Real Cost Simulator`;
  const description = city
    ? generateCityDescription(city).slice(0, 155)
    : `Rough breakdown of rent, bills and commute costs for single renters in ${cityLabel}.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/enough/${country}/${citySlug}/` },
    robots: { index: true, follow: true },
  };
}

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
      </Suspense>
    </main>
  );
}
