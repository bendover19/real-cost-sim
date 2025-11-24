import type { Metadata } from "next";
import { UK_CITIES, approximateNetFromGrossUK } from "../../../../cityConfig";

// This page is purely server-side, no hooks.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  country: string;
  city: string;
  salary: string;
};

type CityConfig = (typeof UK_CITIES)[number];

export const metadata: Metadata = {
  title: "Is this salary enough?",
  description:
    "Rough check of whether a salary is enough to live in a given city after rent, bills and commute.",
};

// Small helper: find city by slug (case-insensitive)
function getCity(slug: string | undefined): CityConfig | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  const found = UK_CITIES.find((c) => c.slug === s);
  return found ?? null;
}

export default function EnoughCityPage({ params }: { params: Params }) {
  const { country, city, salary } = params;

  const debugParams = JSON.stringify(params);

  const cityConfig =
    getCity(city) ??
    ({
      slug: city?.toLowerCase() || "unknown",
      label: city ? city : "this city",
      country: country || "uk",
      currency: "£",
      typicalRentSingle: 1000,
      typicalBills: 150,
      typicalCommuteCost: 120,
      typicalCommuteMins: 60,
    } as CityConfig);

  const grossYear = Number(salary) || 0;
  const netMonth =
    grossYear > 0 ? approximateNetFromGrossUK(grossYear) / 12 : 0;

  const rent = cityConfig.typicalRentSingle;
  const bills = cityConfig.typicalBills;
  const commute = cityConfig.typicalCommuteCost;
  const maintenance = 0; // we’ll keep this simple for now
  const savings = 0;

  const leftover = netMonth - rent - bills - commute - maintenance - savings;

  const verdict =
    leftover > 800
      ? "Comfortable for a single person."
      : leftover > 300
      ? "Tight but doable if you budget carefully."
      : leftover > 0
      ? "Very tight – expect sacrifices."
      : "Extremely tight / probably not sustainable";

  const currency = cityConfig.currency || "£";
  const cityLabel = cityConfig.label;

  const formattedGross =
    grossYear > 0
      ? `${currency}${grossYear.toLocaleString()} / year`
      : `£0 / year`;

  const formattedNetMonth =
    netMonth > 0
      ? `${currency}${Math.round(netMonth).toLocaleString()} / month`
      : `${currency}0 / month`;

  const formattedLeftover = `${currency}${Math.round(leftover).toLocaleString()} / month`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-sky-50 text-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <section className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 md:p-8">
          {/* DEBUG – so we can confirm params are correct */}
          <div className="text-[11px] text-zinc-500 mb-1">
            params: {debugParams}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Is {currency}
            {grossYear.toLocaleString()} enough to live in {cityLabel}?
          </h1>

          <p className="mt-3 text-sm text-zinc-600 max-w-2xl">
            Rough estimate of what&apos;s left after typical rent, bills and
            commute for a single renter in {cityLabel}. It&apos;s ballpark only
            — the full simulator lets you plug in your exact numbers and
            lifestyle costs.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-medium">
            <span className="uppercase tracking-wide text-[10px] text-rose-500">
              Verdict:
            </span>
            <span>{verdict}</span>
          </div>

          {/* Summary cards */}
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-4 text-sm">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Gross salary
              </div>
              <div className="mt-1 font-semibold">{formattedGross}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Est. take-home
              </div>
              <div className="mt-1 font-semibold">{formattedNetMonth}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Est. leftover
              </div>
              <div
                className={`mt-1 font-semibold ${
                  leftover >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {formattedLeftover}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Hour of freedom
              </div>
              <div className="mt-1 font-semibold text-zinc-800">
                {leftover <= 0 ? "negative" : "coming soon"}
              </div>
            </div>
          </div>

          {/* Simple breakdown */}
          <div className="mt-8 text-sm">
            <h2 className="font-semibold mb-3">
              Rough monthly breakdown in {cityLabel}
            </h2>
            <div className="border rounded-2xl overflow-hidden">
              <div className="flex justify-between px-4 py-2 border-b bg-zinc-50">
                <span>Net pay (after tax)</span>
                <span>
                  {currency}
                  {Math.round(netMonth).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b">
                <span>Rent</span>
                <span>
                  {currency}
                  {rent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b">
                <span>Bills &amp; council tax</span>
                <span>
                  {currency}
                  {bills.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b">
                <span>Commute costs</span>
                <span>
                  {currency}
                  {commute.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2 bg-zinc-50 font-medium">
                <span>Estimated leftover</span>
                <span
                  className={
                    leftover >= 0 ? "text-emerald-700" : "text-rose-700"
                  }
                >
                  {formattedLeftover}
                </span>
              </div>
            </div>
          </div>

          {/* Link to main simulator */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2">
              Try your exact numbers in the Real Cost Simulator
            </h3>
            <a
              href={`https://www.real-cost-sim.com/?city=${encodeURIComponent(
                cityLabel,
              )}&region=UK`}
              className="inline-flex items-center rounded-full bg-rose-600 text-white text-sm px-4 py-2 font-medium shadow-sm hover:bg-rose-700 transition"
            >
              Open this scenario in the Real Cost Simulator →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
