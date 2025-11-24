// app/enough/[country]/[city]/[salary]/page.tsx

import type { Metadata } from "next";
import { UK_CITIES, approximateNetFromGrossUK } from "../../../../cityConfig";

// The dynamic route params from /enough/[country]/[city]/[salary]
type Params = {
  country: string;
  city: string;
  salary: string;
};

type CityConfig = (typeof UK_CITIES)[number];

// ---------- helpers ----------

function findCity(slug: string | undefined): CityConfig {
  if (!slug) return UK_CITIES[0]; // default first city in config
  const lower = slug.toLowerCase();
  return (
    UK_CITIES.find((c) => c.slug.toLowerCase() === lower) ??
    UK_CITIES[0]
  );
}

function salaryToNetMonthly(salaryStr: string): number {
  const grossYear = Number(salaryStr);
  if (!Number.isFinite(grossYear) || grossYear <= 0) return 0;

  // If approximateNetFromGrossUK returns yearly net, divide by 12.
  // If it returns monthly, just remove the "/ 12".
  const netYear = approximateNetFromGrossUK(grossYear);
  return Math.round(netYear / 12);
}

// ---------- metadata (SEO) ----------

export function generateMetadata(
  { params }: { params: Params }
): Metadata {
  const city = findCity(params.city);
  const grossYear = Number(params.salary) || 0;

  const salaryText =
    grossYear > 0
      ? `£${grossYear.toLocaleString()} salary in ${city.label}`
      : `Salary in ${city.label}`;

  return {
    title: `${salaryText} – is it enough to live there? | Real Cost Simulator`,
    description: `Rough breakdown of rent, bills, commute and what's left each month for a typical single renter on ${
      grossYear > 0 ? "£" + grossYear.toLocaleString() : "this salary"
    } in ${city.label}. Then jump into the Real Cost Simulator to plug in your exact numbers.`
  };
}

// ---------- page component ----------

export default function EnoughPage({ params }: { params: Params }) {
  const city = findCity(params.city);
  const grossYear = Number(params.salary) || 0;
  const netMonth = salaryToNetMonthly(params.salary);

  const rent = city.typicalRentSingle;
  const bills = city.typicalBills;
  const commute = city.typicalCommuteCost;
  const leftover = netMonth - rent - bills - commute;

  let verdict: string;
  if (netMonth <= 0 || leftover <= 0) {
    verdict = "Extremely tight / probably not sustainable";
  } else if (leftover < 400) {
    verdict = "Tight but survivable if you’re very careful";
  } else {
    verdict = "Reasonable buffer – still worth checking your exact numbers";
  }

  // super rough “hour of freedom” – assume 40h/week
  const freedom =
    netMonth > 0 ? leftover / (40 * 4.3) : 0;

  // Link into your main simulator (tweak query keys if needed)
  const simulatorHref = `/sim?region=UK&city=${encodeURIComponent(
    city.slug
  )}&income=${grossYear || ""}&utm_source=salary-page`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fee2e2,_#eff6ff)] py-12 px-4 text-zinc-900">
      <div className="max-w-3xl mx-auto">
        <section className="bg-white/90 rounded-3xl shadow-xl border border-rose-100 p-6 md:p-8 space-y-6">
          {/* tiny debug line so we can SEE params now actually work */}
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">
            URL params → country: <code>{params.country}</code> · city:{" "}
            <code>{params.city}</code> · salary:{" "}
            <code>{params.salary}</code>
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold">
            Is{" "}
            {grossYear > 0
              ? `£${grossYear.toLocaleString()}`
              : "this salary"}{" "}
            enough to live in {city.label}?
          </h1>

          <p className="text-sm text-zinc-600">
            Rough estimate of what&apos;s left after typical rent, bills and
            a normal commute for a single renter in {city.label}. This is
            just a ball-park view — for proper planning, plug your exact
            numbers into the Real Cost Simulator below.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs text-rose-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {verdict}
          </div>

          {/* headline stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="border rounded-2xl px-3 py-3 bg-zinc-50">
              <div className="text-[11px] uppercase text-zinc-500">
                Gross salary
              </div>
              <div className="mt-1 font-semibold">
                {grossYear > 0
                  ? `£${grossYear.toLocaleString()} / year`
                  : "Unknown"}
              </div>
            </div>

            <div className="border rounded-2xl px-3 py-3 bg-zinc-50">
              <div className="text-[11px] uppercase text-zinc-500">
                Est. take-home
              </div>
              <div className="mt-1 font-semibold">
                £{netMonth.toLocaleString()} / month
              </div>
            </div>

            <div className="border rounded-2xl px-3 py-3 bg-zinc-50">
              <div className="text-[11px] uppercase text-zinc-500">
                Est. leftover
              </div>
              <div className="mt-1 font-semibold text-rose-600">
                £{leftover.toLocaleString()} / month
              </div>
            </div>

            <div className="border rounded-2xl px-3 py-3 bg-zinc-50">
              <div className="text-[11px] uppercase text-zinc-500">
                Hour of freedom*
              </div>
              <div className="mt-1 font-semibold">
                {freedom > 0 ? `£${freedom.toFixed(2)} / hr` : "negative"}
              </div>
              <div className="mt-1 text-[10px] text-zinc-400">
                *rough: leftover ÷ 40 hours/week
              </div>
            </div>
          </div>

          {/* simple table */}
          <div className="border rounded-2xl overflow-hidden text-sm">
            <div className="bg-zinc-50 px-4 py-2 font-medium">
              Rough monthly breakdown in {city.label}
            </div>
            <dl className="divide-y text-sm">
              <div className="flex justify-between px-4 py-2">
                <dt>Net pay (after tax)</dt>
                <dd>£{netMonth.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between px-4 py-2">
                <dt>Rent</dt>
                <dd>£{rent.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between px-4 py-2">
                <dt>Bills & council tax</dt>
                <dd>£{bills.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between px-4 py-2">
                <dt>
                  Commute costs{" "}
                  <span className="text-[11px] text-zinc-400">
                    ~{city.typicalCommuteMins} mins/day
                  </span>
                </dt>
                <dd>£{commute.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between px-4 py-2 font-semibold bg-rose-50">
                <dt>Estimated leftover</dt>
                <dd className={leftover >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  £{leftover.toLocaleString()} / month
                </dd>
              </div>
            </dl>
          </div>

          {/* CTA into main simulator */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Try your exact numbers in the Real Cost Simulator
            </p>
            <a
              href={simulatorHref}
              className="inline-flex justify-center items-center rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2 transition"
            >
              Open this scenario in the Real Cost Simulator →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
