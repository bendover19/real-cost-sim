// app/enough/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { UK_CITIES } from "../cityConfig";

export const metadata: Metadata = {
  title: "Is this salary enough in your city? | Real Cost Sim",
  description:
    "Browse UK cities and see if a salary is enough after rent, bills and commute. Then open your exact scenario in the full Real Cost Simulator.",
};

const POPULAR_CITY_SLUGS = [
  "london",
  "manchester",
  "birmingham",
  "bristol",
  "edinburgh",
];

export default function EnoughHubPage() {
  const popularCities = UK_CITIES.filter((c) =>
    POPULAR_CITY_SLUGS.includes(c.slug)
  );

  const otherCities = UK_CITIES.filter(
    (c) => !POPULAR_CITY_SLUGS.includes(c.slug)
  ).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <section className="w-full max-w-4xl">
        <div className="rounded-3xl bg-white/95 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-3">
            UK · Cost of living
          </p>

          <h1 className="text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900 mb-3">
            Is this salary enough in your city?
          </h1>

          <p className="text-sm md:text-[15px] text-zinc-600 mb-4 leading-relaxed">
            These city pages give a rough answer to “Is £X enough to live in
            {` `}a specific UK city?” by combining typical rent, bills and
            commute costs for a single renter. They&apos;re a quick way to sense-check
            a job offer, relocation or promotion.
          </p>

          <p className="text-sm md:text-[15px] text-zinc-600 mb-6 leading-relaxed">
            Click a city to see a rough breakdown and verdict. From there you
            can open the full Real Cost Simulator to plug in your exact salary,
            commute and living setup.
          </p>

          {/* CTA to main simulator */}
          <div className="mb-8">
            <Link
              href="/sim"
              className="inline-flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold px-4 py-2 transition-colors"
            >
              Start with the full simulator →
            </Link>
            <p className="mt-2 text-[12px] text-zinc-500">
              Or jump straight into a city page below.
            </p>
          </div>

          {/* Popular cities */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Popular UK cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/enough/uk/${city.slug}`}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[13px] text-zinc-800 hover:bg-zinc-100 transition"
                >
                  {`Is this salary enough in ${city.label}?`}
                </Link>
              ))}
            </div>
          </div>

          {/* All UK cities */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              All supported UK cities
            </h2>
            <p className="text-[12px] text-zinc-500 mb-3">
              Each city page lets you check whether a salary looks comfortable,
              tight or unsustainable after typical rent, bills and commute. For
              precise planning, use the main simulator.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {otherCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/enough/uk/${city.slug}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 hover:bg-zinc-100 transition flex flex-col"
                >
                  <span className="font-medium text-zinc-900">
                    {city.label}
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">
                    Typical rent ~£{city.typicalRentSingle.toLocaleString("en-GB")} ·
                    commute ~{city.typicalCommuteMins} mins/day
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
