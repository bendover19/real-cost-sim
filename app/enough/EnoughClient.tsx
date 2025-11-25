"use client";

import { useSearchParams } from "next/navigation";
import { UK_CITIES, approximateNetFromGrossUK } from "../cityConfig";

type CityConfig = (typeof UK_CITIES)[number];

function getCityConfig(slug: string | null): CityConfig | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return UK_CITIES.find((c) => c.slug.toLowerCase() === s) ?? null;
}

function parseSalary(raw: string | null): number {
  if (!raw) return 0;
  const cleaned = decodeURIComponent(raw).replace(/[^0-9]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatGBP(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
}

export default function EnoughClient() {
  const searchParams = useSearchParams();

  const country = (searchParams.get("country") ?? "uk").toLowerCase();
  const citySlug = (searchParams.get("city") ?? "").toLowerCase();
  const rawSalary = searchParams.get("salary");

  const city = getCityConfig(citySlug);
  const salary = parseSalary(rawSalary);

  const cityLabel = city?.label ?? (citySlug || "this city");
  const countryLabel = (city?.country ?? country).toUpperCase();

  // income
  const grossAnnual = salary;
  const netAnnual = grossAnnual > 0 ? approximateNetFromGrossUK(grossAnnual) : 0;
  const netMonthly = netAnnual / 12;

  // costs (rough)
  const rent = city?.typicalRentSingle ?? 1000;
  const bills = city?.typicalBills ?? 150;
  const commute = city?.typicalCommuteCost ?? 120;

  const leftover = netMonthly - rent - bills - commute;

  const verdict =
    !grossAnnual
      ? "Salary missing in URL"
      : leftover > 400
      ? "Comfortable (roughly)"
      : leftover > 0
      ? "Tight but possible"
      : "Extremely tight / probably not sustainable";

  const simulatorUrl = `/sim?country=${country}&city=${citySlug}&salary=${grossAnnual || ""}`;

  return (
    <section className="w-full max-w-3xl">

      <div className="rounded-3xl bg-white/90 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-3">
          {countryLabel} · {cityLabel}
        </p>

        <h1 className="text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900 mb-3">
          Is{" "}
          {grossAnnual
            ? `£${grossAnnual.toLocaleString("en-GB")}`
            : "this salary"}{" "}
          enough to live in {cityLabel}?
        </h1>

        <p className="text-sm md:text-[15px] text-zinc-600 mb-4 leading-relaxed">
          Rough estimate of what&apos;s left after typical rent, bills and commute
          for a single renter in {cityLabel}. For proper planning, plug your own
          numbers into the full Real Cost Simulator.
        </p>

        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[11px] font-medium text-rose-600 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>{verdict}</span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
              Gross salary
            </p>
            <p className="font-semibold text-zinc-900">
              {grossAnnual ? formatGBP(grossAnnual) : "Unknown"}
              <span className="text-[11px] text-zinc-500"> / year</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
              Est. take-home
            </p>
            <p className="font-semibold text-zinc-900">
              {formatGBP(netMonthly)}
              <span className="text-[11px] text-zinc-500"> / month</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
              Est. leftover
            </p>
            <p
              className={
                "font-semibold " +
                (leftover < 0 ? "text-rose-600" : leftover < 400 ? "text-amber-600" : "text-emerald-600")
              }
            >
              {formatGBP(leftover)}
              <span className="text-[11px] text-zinc-500"> / month</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
              Hour of freedom*
            </p>
            <p className="font-semibold text-zinc-900">
              {grossAnnual ? (leftover > 0 ? "positive" : "negative") : "n/a"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              *very rough, based on leftovers vs. working hours
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <h2 className="text-sm font-semibold text-zinc-900 mb-2">
          Rough monthly breakdown in {cityLabel}
        </h2>

        <div className="rounded-2xl border border-zinc-200 overflow-hidden text-sm mb-6">
          <div className="grid grid-cols-[2fr,1fr] bg-zinc-50 text-[11px] font-medium text-zinc-500 px-4 py-2">
            <span>Category</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-zinc-100">
            <Row label="Net pay (after tax)" value={netMonthly} />
            <Row label="Rent" value={rent} />
            <Row label="Bills & council tax" value={bills} />
            <Row
              label="Commute costs"
              value={commute}
              note="~60–70 mins/day"
            />
            <Row
              label="Estimated leftover"
              value={leftover}
              highlight
            />
          </div>
        </div>

        {/* link to main simulator */}
        <p className="text-[13px] text-zinc-600 mb-2">
          Try your exact numbers in the Real Cost Simulator:
        </p>
        <a
          href={simulatorUrl}
          className="inline-flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold px-4 py-2 transition-colors"
        >
          Open this scenario in the Real Cost Simulator →
        </a>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: number;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[2fr,1fr] items-baseline px-4 py-2 text-sm">
      <div>
        <p className="text-zinc-700">{label}</p>
        {note && <p className="text-[11px] text-zinc-400 mt-0.5">{note}</p>}
      </div>
      <p
        className={
          "text-right font-medium " +
          (highlight ? "text-rose-600" : "text-zinc-800")
        }
      >
        {formatGBP(value)}
      </p>
    </div>
  );
}
