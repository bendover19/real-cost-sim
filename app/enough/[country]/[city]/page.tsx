import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "@app/enough/EnoughClient";
import {
  UK_CITIES,
  generateCityDescription,
  type CityConfig,
} from "@app/cityConfig";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

const BASE_URL = "https://www.real-cost-sim.com";

// 🔥 Pre-render all UK city pages at build time
export async function generateStaticParams() {
  return UK_CITIES.map((city) => ({
    country: "uk",
    city: city.slug,
  }));
}

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

      {/* City-specific FAQ schema for rich results */}
      <EnoughFaqJsonLd citySlug={params.city} />
    </main>
  );
}

// ---------- FAQ JSON-LD (FAQPage schema) ----------

function EnoughFaqJsonLd({ citySlug }: { citySlug?: string }) {
  const slug = (citySlug ?? "london").toLowerCase();
  const city = UK_CITIES.find((c) => c.slug === slug);
  if (!city) return null;

  const faqJsonLd = buildCityFaqJsonLd(city);

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a raw string
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}

function buildCityFaqJsonLd(city: CityConfig) {
  const cityName = city.label;
  const rent = city.typicalRentSingle;
  const bills = city.typicalBills;
  const commute = city.typicalCommuteCost;
  const exampleSalary = 28000; // just a simple reference salary

  const salaryStr = `£${exampleSalary.toLocaleString("en-GB")}`;
  const rentStr = `£${rent.toLocaleString("en-GB")}`;
  const billsStr = `£${bills.toLocaleString("en-GB")}`;
  const commuteStr = `£${commute.toLocaleString("en-GB")}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${salaryStr} enough to live in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `As a rough guide, ${salaryStr} a year in ${cityName} can cover typical rent, bills and commute for a single renter, but how comfortable it feels depends on your lifestyle, debts and other costs.`,
        },
      },
      {
        "@type": "Question",
        name: `What is a typical monthly rent in ${cityName} for a single renter?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A simple benchmark for ${cityName} is around ${rentStr} per month in rent for a single renter, though prices vary by neighbourhood and property type.`,
        },
      },
      {
        "@type": "Question",
        name: `How much should I budget for monthly bills and council tax in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For a single renter in ${cityName}, a reasonable starting point is about ${billsStr} per month for utilities and council tax, on top of rent.`,
        },
      },
      {
        "@type": "Question",
        name: `What are typical commute costs in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `In the Real Cost Simulator we assume roughly ${commuteStr} per month in commute costs for ${cityName}, but this will be higher or lower depending on how far you travel and which transport you use.`,
        },
      },
    ],
  };
}
