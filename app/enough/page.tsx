import type { Metadata } from "next";
import {
  UK_CITIES,
  approximateNetFromGrossUK,
} from "../cityConfig";

export const dynamic = "force-dynamic";

type SearchParams = {
  country?: string;
  city?: string;
  salary?: string;
};

export const metadata: Metadata = {
  title: "Is this salary enough?",
  description:
    "Check if your salary is enough after rent, commute and the real cost of working.",
};

// helper: find city by slug
const getCity = (slug?: string) =>
  UK_CITIES.find(
    (c) => c.slug.toLowerCase() === (slug || "").toLowerCase()
  );

export default function EnoughPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // read from query string
  const country = (searchParams.country || "uk").toLowerCase();
  const citySlug = searchParams.city;
  const salaryYear = Number(searchParams.salary || "0");

  const city =
    getCity(citySlug) ??
    ({
      slug: "unknown",
      label: "this city",
      country,
      currency: "£",
      typicalRentSingle: 1000,
      typicalBills: 150,
      typicalCommuteCost: 120,
      typicalCommuteMins: 60,
    } as (typeof UK_CITIES)[number]);

  const netMonthly = approximateNetFromGrossUK(salaryYear || 0);
  const housing = city.typicalRentSingle;
  const bills = city.typicalBills;
  const commuteCost = city.typicalCommuteCost;

  const maintenance = Math.round(netMonthly * 0.2);
  const savings = Math.round(netMonthly * 0.08);

  const totalCosts =
    housing + bills + commuteCost + maintenance + savings;
  const leftover = netMonthly - totalCosts;

  const hoursWeekWork = 40;
  const hoursWeekCommute = (city.typicalCommuteMins * 5) / 60;
  const hoursMonth = Math.round((hoursWeekWork + hoursWeekCommute) * 4.3);
  const freedomPerHour =
    hoursMonth > 0 ? leftover / hoursMonth : 0;

  const currency = city.currency;
  const niceSalary = salaryYear
    ? `£${salaryYear.toLocaleString()}`
    : "£0";

  // simple verdict
  let verdict = "Extremely tight / probably not sustainable";
  const ratio = netMonthly > 0 ? leftover / netMonthly : -1;
  if (ratio >= 0.3) verdict = "Comfortable (on paper)";
  else if (ratio >= 0.15) verdict = "Reasonable, but you’ll feel it";
  else if (ratio >= 0.05) verdict = "Tight – manageable but fragile";

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-amber-50">
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
            {/* tiny debug – you can delete later */}
            <div className="text-[11px] text-zinc-500 mb-2">
              searchParams: {JSON.stringify(searchParams)}
            </div>

            <header className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 leading-tight">
                Is {niceSalary} enough to live in {city.label}?
              </h1>
              <p className="text-zinc-700 text-sm md:text-base">
                Rough estimate of what&apos;s left after rent, bills,
                commute and the real cost of staying employable in{" "}
                {city.label}.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                <span>Verdict:</span>
                <span>{verdict}</span>
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
