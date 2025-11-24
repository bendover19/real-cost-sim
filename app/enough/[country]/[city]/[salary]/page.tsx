// app/enough/[country]/[city]/[salary]/page.tsx
import type { Metadata } from "next";
import { UK_CITIES, approximateNetFromGrossUK } from "../../../../cityConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  country: string;
  city: string;
  salary: string;
};

type CityConfig = {
  slug: string;
  label: string;
  country: string;
  currency: string;
  typicalRentSingle: number;
  typicalBills: number;
  typicalCommuteCost: number;
  typicalCommuteMins: number;
};

/* ---------- helpers ---------- */

function getCityConfig(citySlug: string | undefined): CityConfig | null {
  if (!citySlug) return null;
  const slug = citySlug.toLowerCase();
  const match = UK_CITIES.find((c) => c.slug.toLowerCase() === slug);
  return match ?? null;
}

function parseSalary(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = decodeURIComponent(raw).replace(/[^0-9]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function formatGBP(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
}

/* ---------- metadata ---------- */

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const city = getCityConfig(params.city);
  const gross = parseSalary(params.salary);

  const cityLabel = city?.label ?? "this city";
  const salaryLabel = gross ? formatGBP(gross) : "this salary";

  return {
    title: `Is ${salaryLabel} enough to live in ${cityLabel}?`,
    description: `Rough estimate of what's left after typical rent, bills and commute for a single renter in ${cityLabel} on ${salaryLabel}.`,
  };
}

/* ---------- page component ---------- */

export default function EnoughPage({ params }: { params: Params }) {
  const grossYear = parseSalary(params.salary);
  const cityFromSlug = getCityConfig(params.city);

  const fallbackCity: CityConfig = {
    slug: "unknown",
    label: "this city",
    country: params.country || "uk",
    currency: "£",
    typicalRentSingle: 1400,
    typicalBills: 150,
    typicalCommuteCost: 120,
    typicalCommuteMins: 60,
  };

  const city = cityFromSlug ?? fallbackCity;

  // Income
  const netYear = grossYear > 0 ? approximateNetFromGrossUK(grossYear) : 0;
  const netMonth = Math.round(netYear / 12);

  // Costs
  const rent = city.typicalRentSingle;
  const bills = city.typicalBills;
  const commute = city.typicalCommuteCost;

  const leftover = netMonth - rent - bills - commute;

  const verdict =
    grossYear === 0
      ? "Salary missing in URL"
      : leftover >= 600
      ? "Comfortable"
      : leftover >= 200
      ? "Tight but maybe workable"
      : "Extremely tight / probably not sustainable";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <section className="w-full max-w-4xl bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-rose-50 p-6 md:p-10">
        {/* SMALL BREADCRUMB */}
        <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-400 mb-4">
          URL PARAMS →{" "}
          <span className="font-medium text-zinc-500">
            country: {params.country || "–"}
          </span>{" "}
          ·{" "}
          <span className="font-medium text-zinc-500">
            city: {city.label}
          </span>{" "}
          ·{" "}
          <span className="font-medium text-zinc-500">
            salary: {grossYear ? formatGBP(grossYear) : "– (missing)"}
          </span>
        </div>

        {/* TITLE + INTRO */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-[32px] font-semibold text-zinc-900 mb-3">
            Is {grossYear ? formatGBP(grossYear) : "this salary"} enough to live
            in {city.label}?
          </h1>
          <p className="text-sm md:text-[15px] leading-relaxed text-zinc-600 max-w-2xl">
            Rough estimate of what&apos;s left after typical rent, bills and
            commute for a single renter in {city.label}. For proper planning,
            use the Real Cost Simulator with your exact numbers.
          </p>

          <div className="inline-flex items-center mt-4 rounded-full bg-rose-50 text-[11px] px-3 py-1 border border-rose-100 text-rose-700">
            <span className="mr-2 font-medium">Verdict:</span>
            <span>{verdict}</span>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3">
            <div className="text-[11px] tracking-[0.12em] uppercase text-zinc-400 mb-1.5">
              Gross salary
            </div>
            <div className="text-zinc-900 font-semibold text-base md:text-lg">
              {grossYear ? `${formatGBP(grossYear)} / year` : "Unknown"}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3">
            <div className="text-[11px] tracking-[0.12em] uppercase text-zinc-400 mb-1.5">
              Est. take-home
            </div>
            <div className="text-zinc-900 font-semibold text-base md:text-lg">
              {netMonth ? `${formatGBP(netMonth)} / month` : "£0 / month"}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3">
            <div className="text-[11px] tracking-[0.12em] uppercase text-zinc-400 mb-1.5">
              Est. leftover
            </div>
            <div
              className={
                "font-semibold text-base md:text-lg " +
                (leftover >= 0 ? "text-emerald-600" : "text-rose-600")
              }
            >
              {formatGBP(leftover)} / month
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3">
            <div className="text-[11px] tracking-[0.12em] uppercase text-zinc-400 mb-1.5">
              Hour of freedom
            </div>
            <div className="text-zinc-900 font-semibold text-base md:text-lg">
              {leftover > 0 ? "some" : "negative"}
            </div>
          </div>
        </div>

        {/* BREAKDOWN TABLE */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">
            Rough monthly breakdown in {city.label}
          </h2>

          <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white text-sm">
            <div className="flex justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/60 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              <span>Category</span>
              <span>Amount</span>
            </div>

            <div className="flex justify-between px-4 py-3 border-b border-zinc-100">
              <span>Net pay (after tax)</span>
              <span>{formatGBP(netMonth)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-zinc-100">
              <span>Rent</span>
              <span>{formatGBP(rent)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-zinc-100">
              <span>Bills &amp; council tax</span>
              <span>{formatGBP(bills)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-zinc-100">
              <span>
                Commute costs{" "}
                <span className="text-[11px] text-zinc-400">
                  ~{city.typicalCommuteMins} mins/day
                </span>
              </span>
              <span>{formatGBP(commute)}</span>
            </div>

            <div className="flex justify-between px-4 py-3 bg-rose-50/60">
              <span className="font-semibold text-zinc-900">
                Estimated leftover
              </span>
              <span
                className={
                  "font-semibold " +
                  (leftover >= 0 ? "text-emerald-700" : "text-rose-700")
                }
              >
                {formatGBP(leftover)} / month
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-6 md:mt-8">
          <p className="text-sm text-zinc-600 mb-3">
            Try your exact numbers in the Real Cost Simulator:
          </p>
          <a
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition"
            href={`/sim?country=${encodeURIComponent(
              params.country
            )}&city=${encodeURIComponent(
              city.slug
            )}&salary=${encodeURIComponent(grossYear.toString())}`}
          >
            Open this scenario in the Real Cost Simulator →
          </a>
        </section>
      </section>
    </main>
  );
}
