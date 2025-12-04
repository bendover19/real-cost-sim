import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../EnoughClient";
import { UK_CITIES, generateCityDescription } from "@/app/cityConfig";

type Props = {
  params: {
    country: string;
    city: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: Props): Metadata {
  const citySlug = params.city.toLowerCase();
  const city = UK_CITIES.find(c => c.slug === citySlug);

  const cityLabel = city ? city.label : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-cost-sim.com";
  const canonical = `${canonicalBase}/enough/${params.country}/${params.city}`;

  return {
    title: `Is this salary enough to live in ${cityLabel}? | Real Cost Sim`,
    description: `Estimate rent, bills, commute and leftover salary for living in ${cityLabel}.`,
    alternates: { canonical },
  };
}

export default function EnoughCityPage({ params }: Props) {
  const citySlug = params.city.toLowerCase();
  const city = UK_CITIES.find(c => c.slug === citySlug);

  const cityLabel = city ? city.label : citySlug;
  const description = city ? generateCityDescription(city) : "";

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">

      {/* ⭐ SERVER-RENDERED SEO BLOCK — THIS IS THE FIX ⭐ */}
      <section className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-4">
          Is this salary enough to live in {cityLabel}?
        </h1>

        <p className="text-[14px] text-zinc-700 leading-relaxed">
          {description}
        </p>
      </section>

      {/* Client-side simulator (can still hydrate normally) */}
      <Suspense fallback={<div className="mt-16 text-sm text-zinc-500">Loading the calculator…</div>}>
        <EnoughClient serverCity={citySlug} />
      </Suspense>
    </main>
  );
}
