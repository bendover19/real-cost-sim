"use client";

import { useSearchParams } from "next/navigation";
import {
  UK_CITIES,
  approximateNetFromGrossUK,
  generateCityDescription,
} from "../cityConfig";

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

export default function EnoughClient({
  country: initCountry,
  city: initCity,
}: {
  country: string;
  city: string;
}) {
  const searchParams = useSearchParams();

  // Start with server-provided params (correct for SEO + metadata)
  let country = initCountry.toLowerCase();
  let citySlug = initCity.toLowerCase();

  // Allow query-string overrides (only if user specifies them)
  const qsCountry = searchParams.get("country");
  const qsCity = searchParams.get("city");

  if (qsCountry) country = qsCountry.toLowerCase();
  if (qsCity) citySlug = qsCity.toLowerCase();

  const rawSalary = searchParams.get("salary");

  const city = getCityConfig(citySlug);
  const salaryFromQuery = parseSalary(rawSalary);

  // Default salary
  const grossAnnual = salaryFromQuery || 28000;

  const cityLabel = city?.label ?? citySlug;
  const countryLabel = (city?.country ?? country).toUpperCase();

  // income
  const netAnnual =
    grossAnnual > 0 ? approximateNetFromGrossUK(grossAnnual) : 0;
  const netMonthly = netAnnual / 12;

  // costs (rough)
  const rent = city?.typicalRentSingle ?? 1000;
  const bills = city?.typicalBills ?? 150;
  const commute = city?.typicalCommuteCost ?? 120;

  const leftover = netMonthly - rent - bills - commute;

  const verdict =
    leftover > 400
      ? "Comfortable (roughly)"
      : leftover > 0
      ? "Tight but possible"
      : "Extremely tight / probably not sustainable";

  const baseCityUrl = `/enough/${country}/${citySlug}`;
  const simulatorUrl = `/sim?country=${country}&city=${citySlug}&salary=${grossAnnual}`;

  return (
    <section className="w-full max-w-3xl">
      <div className="rounded-3xl bg-white/90 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-3">
          {countryLabel} · {cityLabel}
        </p>

        <h1 className="text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900 mb-3">
          Is £{grossAnnual.toLocaleString("en-GB")} enough to live in {cityLabel}?
        </h1>

        <p className="text-sm md:text-[15px] text-zinc-600 mb-4 leading-relaxed">
          Rough estimate of what's left after typical rent, bills and commute
          for a single renter in {cityLabel}. For proper planning, plug your own
          numbers into the full Real Cost Simulator.
        </p>

        {city && (
          <p className="text-[14px] md:text-[15px] text-zinc-700 leading-relaxed mb-6 whitespace-pre-line">
            {generateCityDescription(city)}
          </p>
        )}

        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[11px] font-medium text-rose-600 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>{verdict}</span>
        </div>

        {/* Summary cards */}
        {/* ... unchanged content below ... */}
      </div>
    </section>
  );
}
