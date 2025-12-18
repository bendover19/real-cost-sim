// app/enough/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { UK_CITIES } from "../cityConfig";

// ------------------------------
// SEO Metadata
// ------------------------------
export const metadata: Metadata = {
  title: "UK Cost of Living by City — Is Your Salary Enough? | Real Cost Simulator",
  description:
    "Compare the cost of living across 30+ UK cities. Check if your salary is enough after rent, bills and commute. View breakdowns for London, Manchester, Bristol, Edinburgh and more.",
  alternates: {
    canonical: "https://www.real-cost-sim.com/enough",
  },
  openGraph: {
    title: "UK Cost of Living by City — Is Your Salary Enough?",
    description:
      "Browse UK cities and see whether a salary is enough after rent, bills and commute. Then plug in your exact scenario in the Real Cost Simulator.",
    url: "https://www.real-cost-sim.com/enough",
    type: "website",
  }
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

        {/* Hidden FAQ Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I know if my salary is enough to live in a UK city?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text":
                      "Each city page shows a rough breakdown of typical rent, bills and commute costs for single renters, plus a leftover estimate. You can then open the Real Cost Simulator to test your exact numbers."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which UK cities are cheapest for single renters?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text":
                      "Cities like Hull, Stoke, Swansea and Derby tend to have lower rents and commute costs. London, Brighton and Oxford are among the most expensive."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I calculate my exact take-home pay and leftover money?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text":
                      "Yes. After opening a city page you can launch the Real Cost Simulator, which calculates your take-home pay, rent impact, commute time value and leftover money with your exact setup."
                  }
                }
              ]
            }),
          }}
        />

        <div className="rounded-3xl bg-white/95 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-3">
            UK · Cost of Living
          </p>

          <h1 className="text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900 mb-3">
            UK city cost of living — is your salary enough?
          </h1>

          <p className="text-sm md:text-[15px] text-zinc-600 mb-4 leading-relaxed">
            Browse UK cities to see whether a salary is enough after typical
            rent, bills and commute. These breakdowns offer a quick sense-check
            for job offers, relocations or promotions.
          </p>

          <p className="text-sm md:text-[15px] text-zinc-600 mb-6 leading-relaxed">
            Every city page includes a rough leftover estimate per month, plus an
            option to plug your exact salary and lifestyle into the full Real
            Cost Simulator.
          </p>

          {/* Methodology / how this works */}
          <div className="mb-8 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900 mb-1">How this works</h2>
            <p className="text-[13px] text-zinc-600 leading-relaxed">
              City estimates use typical rent, bills and commute time benchmarks
              for single renters. Take-home pay is calculated using UK tax bands and
              National Insurance rates. For precise planning, open your scenario in
              the full Real Cost Simulator.
            </p>
          </div>

          {/* CTA to main simulator */}
          <div className="mb-10">
            <Link
              href="/sim"
              className="inline-flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold px-4 py-2 transition-colors"
            >
              Try the full cost simulator →
            </Link>
            <p className="mt-2 text-[12px] text-zinc-500">
              Or choose a city below to explore its cost breakdown.
            </p>
          </div>

          {/* Popular cities */}
          <div className="mb-10">
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

          {/* All cities */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">
              Compare cost of living across UK cities
            </h2>
            <p className="text-[12px] text-zinc-500 mb-3">
              Explore rent, bills and commute expectations in every city. Each
              page helps you understand whether a salary feels comfortable,
              tight or unsustainable.
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
                    Rent ~£{city.typicalRentSingle.toLocaleString("en-GB")} ·
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
