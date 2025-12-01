// app/enough/[country]/[city]/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../../EnoughClient";

type Props = {
  params: { country: string; city: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const country = params.country.toLowerCase();
  const city = params.city.toLowerCase();

  const prettyCity = city.charAt(0).toUpperCase() + city.slice(1);
  const canonical = `https://www.real-cost-sim.com/enough/${country}/${city}`;

  return {
    title: `Is this salary enough to live in ${prettyCity}? | Real Cost Sim`,
    description: `Rough estimate of what's left after rent, bills and commute for a single renter in ${prettyCity}. Check if your salary is enough for ${prettyCity} using the Real Cost Sim.`,
    alternates: {
      canonical,
    },
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
