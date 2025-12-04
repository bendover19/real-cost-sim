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
  country: initialCountry = "uk",
  city: initialCity = "london",
}: {
  country?: string;
  city?: string;
}) {
  const searchParams = useSearchParams();

  // Start with values from server (route params)
  let country = initialCountry.toLowerCase();
  let citySlug = initialCity.toLowerCase();

  // Allow querystring overrides if provided
  const qsCountry = searchParams.get("country");
  const qsCity = searchParams.get("city");
  const rawSalary = searchParams.get("salary");

  if (qsCountry) country = qsCountry.toLowerCase();
  if (qsCity) citySlug = qsCity.toLowerCase();

  const city = getCityConfig(citySlug);
  const salaryFromQuery = parseSalary(rawSalary);

  // Default salary if none given
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

  // nearby salaries
  const nearbySalaries = [grossAnnual - 2000, grossAnnual + 2000].filter(
    (n) => n > 0
  );

  // anchor cities for cross-linking
  const anchorCitySlugs = [
    "london",
    "manchester",
    "birmingham",
    "bristol",
    "edinburgh",
  ];

  const otherCities = anchorCitySlugs
    .filter((slug) => slug !== citySlug)
    .slice(0, 4);

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
          Rough estimate of what&apos;s left after typical rent, bills and commute
          for a single renter in {cityLabel}. For proper planning, plug your own
          numbers into the full Real Cost Simulator.
        </p>

        {/* City-specific descriptive text for SEO / AdSense */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
              Gross salary
            </p>
            <p className="font-semibold text-zinc-900">
              {formatGBP(grossAnnual)}
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
                (leftover < 0
                  ? "text-rose-600"
                  : leftover < 400
                  ? "text-amber-600"
                  : "text-emerald-600")
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
              {leftover > 0 ? "positive" : "negative"}
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
            <Row label="Commute costs" value={commute} note="~60–70 mins/day" />
            <Row label="Estimated leftover" value={leftover} highlight />
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

        {/* Internal links: nearby salaries + other cities */}
        <div className="mt-8 space-y-5 text-sm text-zinc-700">
          {nearbySalaries.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Check nearby salaries in {cityLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbySalaries.map((s) => (
                  <a
                    key={s}
                    href={`${baseCityUrl}?salary=${s}`}
                    className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-[12px] hover:bg-zinc-50"
                  >
                    {`Is £${s.toLocaleString(
                      "en-GB"
                    )} enough in ${cityLabel}?`}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Compare with other cities</h3>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((slug) => {
                const conf = UK_CITIES.find((c) => c.slug === slug);
                const label =
                  conf?.label ??
                  slug.charAt(0).toUpperCase() + slug.slice(1);
                const href = `/enough/${country}/${slug}?salary=${grossAnnual}`;
                return (
                  <a
                    key={slug}
                    href={href}
                    className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-[12px] hover:bg-zinc-50"
                  >
                    {`Same salary in ${label}`}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
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
