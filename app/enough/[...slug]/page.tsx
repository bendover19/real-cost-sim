import type { Metadata } from "next";
import {
  UK_CITIES,
  UK_SALARY_BANDS,
  approximateNetFromGrossUK,
} from "../../cityConfig";

type Params = {
  slug?: string[]; // [country, city, salary]
};

type CityConfig = (typeof UK_CITIES)[number];

// --- helpers ---

function getCityFromSlug(citySlug: string | undefined): CityConfig | null {
  if (!citySlug) return null;
  const slug = citySlug.toLowerCase();
  return UK_CITIES.find((c) => c.slug.toLowerCase() === slug) ?? null;
}

function parseSlug(params: Params) {
  const [country, city, salaryStr] = params.slug ?? [];
  const salaryYear = Number(salaryStr);
  return {
    country: country ?? "uk",
    citySlug: city,
    salaryYear: Number.isFinite(salaryYear) ? salaryYear : 0,
  };
}

// --- static generation ---

export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const city of UK_CITIES) {
    for (const salary of UK_SALARY_BANDS) {
      params.push({ slug: ["uk", city.slug, String(salary)] });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const { citySlug, salaryYear } = parseSlug(params);
  const city = getCityFromSlug(citySlug);

  if (!city || !salaryYear) {
    return {
      title: "Is this salary enough?",
      description:
        "See if your salary is enough after rent, commute and the real cost of working.",
    };
  }

  return {
    title: `Is £${salaryYear.toLocaleString()} enough to live in ${city.label}?`,
    description: `Rough breakdown of what’s left on £${salaryYear.toLocaleString()} in ${city.label} after rent, commute and the real cost of working.`,
  };
}

// --- tiny helper for “verdict” text ---

function classifyLeftoverRatio(ratio: number): {
  label: string;
  tone: "bad" | "ok" | "good";
} {
  if (ratio < 0.05)
    return {
      label: "Extremely tight / probably not sustainable",
      tone: "bad",
    };
  if (ratio < 0.15)
    return { label: "Tight – manageable but fragile", tone: "ok" };
  if (ratio < 0.3)
    return { label: "Reasonable, but you’ll feel it", tone: "ok" };
  return { label: "Comfortable (on paper)", tone: "good" };
}

// --- page component ---

export default function EnoughPage({ params }: { params: Params }) {
  const parsed = parseSlug(params);
  const city = getCityFromSlug(parsed.citySlug);

  // DEBUG – leave this for now so we can see what Next is passing
  const debugParams = JSON.stringify(params);

  const cityOrFallback =
    city ??
    ({
      slug: parsed.citySlug ?? "unknown",
      label: parsed.citySlug ?? "this city",
      country: parsed.country,
      currency: "£",
      typicalRentSingle: 1000,
      typicalBills: 150,
      typicalCommuteCost: 120,
      typicalCommuteMins: 60,
    } as CityConfig);

  const salaryYear = parsed.salaryYear;
  const netMonthly = approximateNetFromGrossUK(salaryYear);
  const housing = cityOrFallback.typicalRentSingle;
  const bills = cityOrFallback.typicalBills;
  const commuteCost = cityOrFallback.typicalCommuteCost;
  const commuteMinsPerDay = cityOrFallback.typicalCommuteMins;

  const maintenance = Math.round(netMonthly * 0.2);
  const savings = Math.round(netMonthly * 0.08);

  const totalCosts =
    housing + bills + commuteCost + maintenance + savings;
  const leftover = netMonthly - totalCosts;
  const leftoverRatio = netMonthly > 0 ? leftover / netMonthly : -1;

  const hoursWeekWork = 40;
  const hoursWeekCommute = (commuteMinsPerDay * 5) / 60;
  const totalHoursWeek = hoursWeekWork + hoursWeekCommute;
  const hoursMonth = Math.round(totalHoursWeek * 4.3);
  const freedomPerHour =
    hoursMonth > 0 ? Math.round((leftover / hoursMonth) * 100) / 100 : 0;

  const verdict = classifyLeftoverRatio(leftoverRatio);
  const currency = cityOrFallback.currency;
  const niceSalary = salaryYear
    ? `£${salaryYear.toLocaleString()}`
    : "£0";

  const neighbours = UK_SALARY_BANDS.filter(
    (s) => Math.abs(s - salaryYear) <= 10000 && s !== salaryYear
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-amber-50">
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
            {/* DEBUG SECTION – remove later */}
            <div className="text-[11px] text-zinc-500 mb-2">
              <div>params: {debugParams}</div>
              <div>
                matchedCity:{" "}
                {city ? city.slug : "NONE – using fallback config"}
              </div>
            </div>

            <header className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 leading-tight">
                Is {niceSalary} enough to live in {cityOrFallback.label}?
              </h1>
              <p className="text-zinc-700 text-sm md:text-base">
                Rough estimate of what&apos;s left after rent, bills,
                commute and the real cost of staying employable in{" "}
                {cityOrFallback.label}.
              </p>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  verdict.tone === "bad"
                    ? "bg-rose-100 text-rose-800"
                    : verdict.tone === "ok"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                <span>Verdict:</span>
                <span>{verdict.label}</span>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Stat label="Gross salary" value={`${niceSalary} / year`} />
              <Stat
                label="Est. take-home"
                value={`${currency}${netMonthly.toLocaleString()} / month`}
              />
              <Stat
                label="Est. leftover"
                value={`${currency}${leftover.toLocaleString()} / month`}
                highlight
              />
              <Stat
                label="Hour of freedom"
                value={
                  leftover > 0
                    ? `${currency}${freedomPerHour.toFixed(2)} / hr`
                    : "negative"
                }
              />
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                Explore nearby scenarios
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {neighbours.map((s) => (
                  <a
                    key={s}
                    href={`/enough/uk/${cityOrFallback.slug}/${s}`}
                    className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white/80 hover:border-rose-400 hover:text-rose-700 transition"
                  >
                    {`Is £${s.toLocaleString()} enough in ${cityOrFallback.label}?`}
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

// small presentational helper
function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 px-3 py-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold ${
          highlight ? "text-rose-700" : "text-zinc-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
