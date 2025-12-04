// app/enough/[country]/[city]/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../EnoughClient";

export const dynamic = "force-dynamic";

type Params = {
  country?: string;
  city?: string;
};

type Props = {
  params?: Params;
};

export function generateMetadata({ params }: Props): Metadata {
  const rawCountry = params?.country ?? "uk";
  const rawCity = params?.city ?? "london";

  const country = rawCountry.toLowerCase();
  const city = rawCity.toLowerCase();

  const prettyCity = city.charAt(0).toUpperCase() + city.slice(1);

  const canonicalBase =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-cost-sim.com";
  const canonical = `${canonicalBase}/enough/${country}/${city}`;

  return {
    title: `Is this salary enough to live in ${prettyCity}? | Real Cost Sim`,
    description: `Rough estimate of what's left after rent, bills and commute for a single renter in ${prettyCity}. Check if your salary is enough for ${prettyCity} using the Real Cost Sim.`,
    alternates: {
      canonical,
    },
  };
}

export default function EnoughCityPage({ params }: Props) {
  const country = (params?.country ?? "uk").toLowerCase();
  const city = (params?.city ?? "london").toLowerCase();

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        <EnoughClient country={country} city={city} />
      </Suspense>
    </main>
  );
}
