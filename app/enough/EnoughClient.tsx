// app/enough/[country]/[city]/[salary]/page.tsx
import type { Metadata } from "next";
import {
  UK_CITIES,
  UK_SALARY_BANDS,
  approximateNetFromGrossUK,
} from "../../../cityConfig";

type Params = {
  country: string;
  city: string;
  salary: string;
};

type CityConfig = (typeof UK_CITIES)[number];

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

function formatAnnual(value: number): string {
  if (!value || !Number.isFinite(value)) return "£0 / year";
  return `${formatGBP(value)} / year`;
}

function formatMonthly(value: number): string {
  if (!value || !Number.isFinite(value)) return "£0 / month";
  return `${formatGBP(value)} / month`;
}

/* ---------- metadata ---------- */

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const cityConfig = getCityConfig(params.city);
  const salaryNum = parseSalary(params.salary);

  const cityLabel = cityConfig?.label ?? "this city";
  const cityCountry = cityConfig?.country?.toUpperCase() ?? params.country;
  const salaryPretty =
    salaryNum > 0 ? `£${salaryNum.toLocaleString("en-GB")}` : "This salary";

  const title = `Is ${salaryPretty} enough to live in ${cityLabel}?`;
  const description = `Rough estimate of what's left after rent, bills and commute for a single renter in ${cityLabel}, ${cityCountry}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/enough/${params.country}/${params.city}/${params.salary}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

/* ---------- page component ---------- */

export default function EnoughPrettyPage({ params }: { params: Params }) {
  const salaryNum = parseSalary(params.salary);
  const city = getCityConfig(params.city);

  const grossAnnual = salaryNum;
  const netAnnual = approximateNetFromGrossUK(grossAnnual);
  const netMonthly = netAnnual / 12;

  // use city costs if available, otherwise some gentle fallbacks
  const rent = city?.typicalRentSingle ?? 1000;
  const bills = city?.typicalBills ?? 150;
  const commute = city?.typicalCommuteCost ?? 120;
  const maintenance = 0; // you can set e.g. 150 if you want that extra row again

  const totalOutgoings = rent + bills + commute + maintenance;
  const leftover = netMonthly - totalOutgoings;

  const cityLabel = city?.label ?? "this city";
  const countryLabel = (city?.country ?? params.country).toUpperCase();

  // link back into the full simulator – tweak query param names if needed
  const simulatorUrl = `/sim?country=${params.country}&city=${params.city}&salary=${salaryNum || ""}`;

  // a few “nearby” scenarios for internal linking / SEO
  const nearbySalaries = [grossAnnual - 2000, grossAnnual + 2000, grossAnnual + 5000]
    .filter((n) => n > 0)
    .map((n) => Math.round(n / 1000) * 1000); // round to nearest 1k

  const otherCities = UK_CITIES.filter((c) => c.slug !== city?.slug).slice(0, 4);

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <section className="w-full max-w-3xl rounded-3xl bg-white/80 shadow-xl border border-rose-100 px-6 py-7 md:px-10 md:py-9">
        {/* Breadcrumb-ish row */}
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-4">
          {countryLabel} · {cityLabel}
        </p>

        {/* Title */}
        <h1 className="text-3xl md:text-[2.3rem] font-semibold tracking-tight text-zinc-900 mb-3">
          Is {grossAnnual ? `£${grossAnnual.toLocaleString("en-GB")}` : "this salary"}{" "}
          enough to live in {cityLabel}?
        </h1>

        <p className="text-sm md:text-[15px] text-zinc-600 mb-5 leading-relaxed">
          Rough estimate of what&apos;s left after typical rent, bills and commute
          for a single renter in {cityLabel}. For proper planning, plug your own
          numbers into the full Real Cost Simulator below.
        </p>

        {/* Verdict pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[11px] font-medium text-rose-600 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>
            {leftover > 400
              ? "Comfortable (roughly)"
              : leftover > 0
              ? "Tight but possible"
              : "Extremely tight / probably not sustainable"}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="border border-zinc-200 rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-1">
              Gross salary
            </p>
            <p className="text-[15px] font-semibold text-zinc-900">
              {formatAnnual(grossAnnual)}
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-1">
              Est. take-home
            </p>
            <p className="text-[15px] font-semibold text-zinc-900">
              {formatMonthly(netMonthly)}
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-1">
              Est. leftover
            </p>
            <p className="text-[15px] font-semibold text-rose-600">
              {formatMonthly(leftover)}
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-1">
              Hour of freedom*
            </p>
            <p className="text-[15px] font-semibold text-zinc-900">
              {leftover > 0 ? "positive" : "negative"}
            </p>
            <p className="mt-1 text-[10px] text-zinc-400">
              *very rough, based on leftovers vs. working hours
            </p>
          </div>
        </div>

        {/* Monthly breakdown */}
        <h2 className="text-sm font-semibold text-zinc-900 mb-2">
          Rough monthly breakdown in {cityLabel}
        </h2>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 mb-8">
          <div className="grid grid-cols-[2fr,1fr] bg-zinc-50 text-[11px] font-medium text-zinc-500 px-4 py-2">
            <span>Category</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-zinc-100 text-sm">
            <Row label="Net pay (after tax)" value={netMonthly} />
            <Row label="Rent" value={rent} />
            <Row label="Bills & council tax" value={bills} />
            <Row label="Commute costs" value={commute} note="~60–70 mins/day" />
            {maintenance > 0 && (
              <Row
                label="“Maintenance” & coping spends"
                value={maintenance}
                note="food, work clothes, small treats"
              />
            )}
            <Row
              label="Estimated leftover"
              value={leftover}
              highlight
            />
          </div>
        </div>

        {/* Button: open in full simulator */}
        <div className="mb-6">
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

        {/* Explore nearby scenarios */}
        <div className="border-t border-zinc-100 pt-4 mt-4">
          <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">
            Explore nearby scenarios
          </h3>

          <div className="flex flex-wrap gap-2 text-[12px]">
            {nearbySalaries.map((s) => (
              <a
                key={`nearby-same-${s}`}
                href={`/enough/${params.country}/${params.city}/${s}`}
                className="px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
              >
                Same city, £{s.toLocaleString("en-GB")} salary
              </a>
            ))}

            {otherCities.map((c) => (
              <a
                key={`nearby-city-${c.slug}`}
                href={`/enough/${params.country}/${c.slug}/${grossAnnual || 28000}`}
                className="px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
              >
                {grossAnnual
                  ? `£${grossAnnual.toLocaleString("en-GB")} in ${c.label}`
                  : `Same salary in ${c.label}`}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* simple row component to keep JSX tidy */
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

/* ---------- programmatic SEO: pre-generate a bunch of URLs ---------- */

export const dynamicParams = true;

export function generateStaticParams() {
  const country = "uk"; // all UK for now

  const salaries = UK_SALARY_BANDS.map((s) => String(s));

  return UK_CITIES.flatMap((city) =>
    salaries.map((salary) => ({
      country,
      city: city.slug,
      salary,
    }))
  );
}
