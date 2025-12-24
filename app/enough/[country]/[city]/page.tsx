import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import EnoughClient from "@app/enough/EnoughClient";
import { UK_CITIES, generateCityDescription } from "@app/cityConfig";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

const BASE_URL = "https://www.real-cost-sim.com";

// 🔥 Pre-render all UK city pages
export async function generateStaticParams() {
  return UK_CITIES.map((city) => ({
    country: "uk",
    city: city.slug,
  }));
}

function labelFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function buildCityFaqJsonLd(city: (typeof UK_CITIES)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is £28,000 enough to live in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `As a rough guide, £28,000 a year in ${city.label} can cover typical rent, bills and commute for a single renter, but how comfortable it feels depends on your lifestyle and other costs.`,
        },
      },
      {
        "@type": "Question",
        name: `What is a typical monthly rent in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A simple benchmark for ${city.label} is around £${city.typicalRentSingle.toLocaleString(
            "en-GB"
          )} per month for a one-bed or room, though prices vary by area.`,
        },
      },
      {
        "@type": "Question",
        name: `How much are bills and council tax in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For a single renter in ${city.label}, a reasonable starting point is about £${city.typicalBills.toLocaleString(
            "en-GB"
          )} per month for utilities and council tax.`,
        },
      },
      {
        "@type": "Question",
        name: `What are typical commute costs in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Real Cost Simulator assumes around £${city.typicalCommuteCost.toLocaleString(
            "en-GB"
          )} per month in commute costs for ${city.label}, depending on distance and transport.`,
        },
      },
    ],
  };
}

// ---------- METADATA ----------
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

// ---------- PAGE ----------
export default function EnoughCityPage({ params }: Props) {
  const citySlug = params.city?.toLowerCase();
  const city = citySlug ? UK_CITIES.find((c) => c.slug === citySlug) : null;

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      {/* ✅ FAQ JSON-LD as a REAL script tag in HTML */}
      {city && (
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCityFaqJsonLd(city)) }}
        />
      )}

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
