import type { Metadata } from "next";
import { UK_CITIES, approximateNetFromGrossUK } from "../../../../cityConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// -------- types (local, simple) --------
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

export const metadata: Metadata = {
  title: "Is this salary enough?",
  description:
    "Check if your salary is enough after rent, housing, commute and the real cost of working.",
};

// -------- helpers (defensive) --------

function safeCities(): CityConfig[] {
  if (Array.isArray(UK_CITIES)) {
    return UK_CITIES as CityConfig[];
  }
  return [];
}

function getCity(slug: string): CityConfig | null {
  const s = (slug || "").toLowerCase();
  const cities = safeCities();
  return cities.find((c) => c.slug.toLowerCase() === s) ?? null;
}

function safeNetFromGross(grossYear: number): number {
  const g = Number.isFinite(grossYear) ? grossYear : 0;
  if (typeof approximateNetFromGrossUK === "function") {
    try {
      return approximateNetFromGrossUK(g);
    } catch {
      // fall back to very rough 75% net assumption
    }
  }
  const monthlyGross = g / 12;
  return Math.round(monthlyGross * 0.75);
}

function classifyLeftoverRatio(ratio: number) {
  if (!Number.isFinite(ratio)) {
    return {
      label: "Extremely tight / probably not sustainable",
      tone: "bad" as const,
    };
  }
  if (ratio < 0.05)
    return {
      label: "Extremely tight / probably not sustainable",
      tone: "bad" as const,
    };
  if (ratio < 0.15)
    return { label: "Tight – manageable but fragile", tone: "ok" as const };
  if (ratio < 0.3)
    return { label: "Reasonable, but you’ll feel it", tone: "ok" as const };
  return { label: "Comfortable (on paper)", tone: "good" as const };
}

// -------- page --------

export default function EnoughCityPage({ params }: { params: Params }) {
  const { country, city: citySlug, salary } = params;

  // DEBUG so we can see what Next passes in
  const debugParams = JSON.stringify(params);

  const salaryYear = Number(salary) || 0;

  const fallbackCity: CityConfig = {
    slug: "unknown",
    label: "this city",
    country: (country || "uk").toLowerCase(),
    currency: "£",
    typicalRentSingle: 1000,
    typicalBills: 150,
    typicalCommuteCost: 120,
    typicalCommuteMins: 60,
  };

  const matchedCity = getCity(citySlug);
  const cityCfg = matchedCity ?? fallbackCity;

  const netMonthly = safeNetFromGross(salaryYear);

  const housing = cityCfg.typicalRentSingle;
  const bills = cityCfg.typicalBills;
  const commuteCost = cityCfg.typicalCommuteCost;

  // simple generic assumptions – tweak later
  const maintenance = Math.round(netMonthly * 0.2);
  const savings = Math.round(netMonthly * 0.08);

  const totalCosts = housing + bills + commuteCost + maintenance + savings;
  const leftover = netMonthly - totalCosts;

  const hoursWeekWork = 40;
  const hoursWeekCommute = (cityCfg.typicalCommuteMins * 5) / 60;
  const hoursMonth = Math.round((hoursWeekWork + hoursWeekCommute) * 4.3);
  const freedomPerHour =
    hoursMonth > 0 ? Math.round((leftover / hoursMonth) * 100) / 100 : 0;

  const currency = cityCfg.currency || "£";
  const niceSalary =
    salaryYear > 0 ? `${currency}${salaryYear.toLocaleString()}` : `${currency}0`;

  const ratio = netMonthly > 0 ? leftover / netMonthly : -1;
  const verdict = classifyLeftoverRatio(ratio);

  const neighbours = [22000, 25000, 28000, 30000, 32000, 35000, 40000].filter(
    (s) => Math.abs(s - salaryYear) <= 10000 && s !== salaryYear
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-amber-50">
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
            {/* DEBUG – remove once happy */}
            <div className="text-[11px] text-zinc-500 mb-1">
              params: {debugParams}
            </div>

            <header className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 leading-tight">
                Is {niceSalary} enough to live in {cityCfg.label}?
              </h1>
              <p className="text-zinc-700 text-sm md:text-base">
                Rough estimate of what&apos;s left after rent, bills, commute
                and the real cost of staying employable in {cityCfg.label}.
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
              <p className="text-xs text-zinc-600">
                These links keep the same city but nudge the salary up or down.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {neighbours.map((s) => (
                  <a
                    key={s}
                    href={`/enough/${country.toLowerCase()}/${cityCfg.slug}/${s}`}
                    className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white/80 hover:border-rose-400 hover:text-rose-700 transition"
                  >
                    {`Is ${currency}${s.toLocaleString()} enough in ${
                      cityCfg.label
                    }?`}
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
