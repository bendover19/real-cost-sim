"use client";

import { useSearchParams } from "next/navigation";
import { UK_CITIES, approximateNetFromGrossUK } from "../cityConfig";

// ----- local types -----

type CityConfig = (typeof UK_CITIES)[number];

// ----- helpers -----

function getCityConfig(citySlug: string | null): CityConfig | null {
  if (!citySlug) return null;
  const slug = citySlug.toLowerCase();
  const match = UK_CITIES.find((c) => c.slug.toLowerCase() === slug);
  return match ?? null;
}

function parseSalary(raw: string | null): number {
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

// ----- main component -----

export default function EnoughClient() {
  const searchParams = useSearchParams();

  // read from the real URL: /enough?country=uk&city=london&salary=28000
  const country = (searchParams.get("country") ?? "uk").toLowerCase();
  const citySlug = (searchParams.get("city") ?? "").toLowerCase();
  const rawSalary = searchParams.get("salary");

  const salary = parseSalary(rawSalary);
  const city = getCityConfig(citySlug);

  const hasSalary = salary > 0;

  // basic city numbers (fallback to 0 if unknown city)
  const rent = city?.typicalRentSingle ?? 0;
  const bills = city?.typicalBills ?? 0;
  const commute = city?.typicalCommuteCost ?? 0;

  // very rough net pay & leftovers
  const netPerMonth = hasSalary ? approximateNetFromGrossUK(salary) : 0;
  const leftover = netPerMonth - rent - bills - commute;

  let verdict = "Salary missing in URL";
  if (hasSalary) {
    if (leftover >= 800) verdict = "Comfortable";
    else if (leftover >= 300) verdict = "Reasonable but watch spending";
    else if (leftover >= 0) verdict = "Very tight";
    else verdict = "Extremely tight / probably not sustainable";
  }

  const cityLabel = city?.label ?? (citySlug ? citySlug : "this city");

  return (
    <section className="w-full max-w-3xl">
      {/* DEBUG: shows what we actually read from the URL */}
      <pre className="mb-4 rounded-lg bg-zinc-900 text-zinc-100 text-[11px] p-3 leading-snug">
        {JSON.stringify(
          {
            urlExample: "/enough?country=uk&city=london&salary=28000",
            readFromUrl: {
              country,
              citySlug,
              rawSalary,
            },
          },
          null,
          2
        )}
      </pre>

      <div className="rounded-3xl bg-white/90 shadow-xl border border-zinc-100 p-8">
        <p className="uppercase tracking-[0.12em] text-[11px] text-zinc-500 mb-2">
          {country.toUpperCase()} · {cityLabel}
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Is{" "}
          {hasSalary ? (
            <span className="font-bold">{formatGBP(salary)} </span>
          ) : (
            "this salary "
          )}
          enough to live in {cityLabel}?
        </h1>

        <p className="text-sm text-zinc-600 mb-4">
          Rough estimate of what's left after typical rent, bills and commute
          for a single renter in {cityLabel}. For proper planning, plug your own
          numbers into the full Real Cost Simulator.
        </p>

        {/* verdict pill */}
        <div className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 text-[11px] px-3 py-1 mb-6">
          <span className="mr-1 font-semibold">Verdict:</span>
          <span>{verdict}</span>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-1">
              Gross salary
            </p>
            <p className="font-semibold">
              {hasSalary ? formatGBP(salary) : "Unknown"}
              <span className="text-[11px] text-zinc-500"> / year</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-1">
              Est. take-home
            </p>
            <p className="font-semibold">
              {formatGBP(netPerMonth)}
              <span className="text-[11px] text-zinc-500"> / month</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-1">
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

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 mb-1">
              Hour of freedom*
            </p>
            <p className="font-semibold">
              {hasSalary ? (leftover > 0 ? "positive" : "negative") : "n/a"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              *very rough, based on leftovers vs. working hours
            </p>
          </div>
        </div>

        {/* breakdown table */}
        <div className="rounded-2xl border border-zinc-100 overflow-hidden text-sm">
          <div className="border-b border-zinc-100 px-4 py-3 font-medium bg-zinc-50">
            Rough monthly breakdown in {cityLabel}
          </div>
          <div className="divide-y divide-zinc-100">
            <Row label="Net pay (after tax)" value={formatGBP(netPerMonth)} />
            <Row label="Rent" value={formatGBP(rent)} />
            <Row label="Bills & council tax" value={formatGBP(bills)} />
            <Row
              label={`Commute costs ~${city?.typicalCommuteMins ?? 60} mins/day`}
              value={formatGBP(commute)}
            />
            <Row
              label="Estimated leftover"
              value={formatGBP(leftover)}
              emphasize
            />
          </div>
        </div>

        <p className="mt-6 text-[11px] text-zinc-500">
          Ballpark figures for a single person renting in {cityLabel}, commuting
          about {city?.typicalCommuteMins ?? 60} minutes per workday. Use the
          full simulator to plug in your real numbers.
        </p>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-zinc-600">{label}</span>
      <span
        className={
          "font-semibold tabular-nums " +
          (emphasize ? "text-rose-600" : "text-zinc-900")
        }
      >
        {value}
      </span>
    </div>
  );
}
