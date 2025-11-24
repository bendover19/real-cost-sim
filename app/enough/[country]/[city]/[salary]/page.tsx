import type { Metadata } from "next";
import {
  UK_CITIES,
  UK_SALARY_BANDS,
  approximateNetFromGrossUK,
} from "../../../cityConfig";

type Params = {
  country: "uk";
  city: string;
  salary: string;
};

type CityConfig = (typeof UK_CITIES)[number];

// --------- helpers ----------
function getCity(country: string, citySlug: string): CityConfig | null {
  if (country === "uk") {
    return UK_CITIES.find((c) => c.slug === citySlug) ?? null;
  }
  return null;
}

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

// --------- generateStaticParams: which pages to build ----------
export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const city of UK_CITIES) {
    for (const salary of UK_SALARY_BANDS) {
      params.push({
        country: "uk",
        city: city.slug,
        salary: String(salary),
      });
    }
  }
  return params;
}

// --------- metadata per page ----------
export function generateMetadata({ params }: { params: Params }): Metadata {
  const city = getCity(params.country, params.city);
  const salary = Number(params.salary);
  if (!city || !Number.isFinite(salary)) {
    return {
      title: "Is this salary enough?",
      description:
        "See if your salary is enough after rent, commute and the real cost of working.",
    };
  }

  const title = `Is £${salary.toLocaleString()} enough to live in ${city.label}?`;
  const description = `A realistic leftover-money breakdown for someone earning £${salary.toLocaleString()} in ${city.label}, after rent, commute and the real cost of working.`;

  return { title, description };
}

// --------- the page itself ----------
export default function Page({ params }: { params: Params }) {
  const city = getCity(params.country, params.city);
  const salaryYear = Number(params.salary);

  if (!city || !Number.isFinite(salaryYear)) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-2">
          Is this salary enough to live here?
        </h1>
        <p className="text-zinc-600">
          Something went wrong with this URL. Try starting from the simulator
          instead.
        </p>
      </main>
    );
  }

  // --- core approximations ---
  const netMonthly = approximateNetFromGrossUK(salaryYear);
  const housing = city.typicalRentSingle;
  const bills = city.typicalBills;
  const commuteCost = city.typicalCommuteCost;
  const commuteMinsPerDay = city.typicalCommuteMins;

  // rough “maintenance” + savings
  const maintenance = Math.round(netMonthly * 0.2); // tweak later
  const savings = Math.round(netMonthly * 0.08); // 8% savings/pension
  const otherFixed = 0;

  const totalCosts =
    housing + bills + commuteCost + maintenance + savings + otherFixed;
  const leftover = netMonthly - totalCosts;
  const leftoverRatio = netMonthly > 0 ? leftover / netMonthly : -1;

  // time: 40h work + commute
  const hoursWeekWork = 40;
  const hoursWeekCommute = (commuteMinsPerDay * 5) / 60; // 5 days/week
  const totalHoursWeek = hoursWeekWork + hoursWeekCommute;
  const hoursMonth = Math.round(totalHoursWeek * 4.3);
  const freedomPerHour =
    hoursMonth > 0 ? Math.round((leftover / hoursMonth) * 100) / 100 : 0;

  const verdict = classifyLeftoverRatio(leftoverRatio);

  const currency = city.currency;
  const niceSalary = `£${salaryYear.toLocaleString()}`;

  const neighbours = UK_SALARY_BANDS.filter(
    (s) => Math.abs(s - salaryYear) <= 10000 && s !== salaryYear
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-amber-50">
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
            {/* H1 + summary */}
            <header className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 leading-tight">
                Is {niceSalary} enough to live in {city.label}?
              </h1>
              <p className="text-zinc-700 text-sm md:text-base">
                This takes a typical single renter in {city.label} on{" "}
                <strong>{niceSalary}</strong> and estimates what&apos;s left
                after rent, bills, commute and the{" "}
                <span className="underline decoration-rose-400 decoration-2">
                  real cost of staying employable
                </span>
                .
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

            {/* headline numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Stat label="Gross salary" value={`${niceSalary} / year`} />
              <Stat
                label="Estimated take-home"
                value={`${currency}${netMonthly.toLocaleString()} / month`}
              />
              <Stat
                label="Estimated leftover"
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

            {/* cost breakdown */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-900">
                Rough monthly breakdown in {city.label}
              </h2>
              <p className="text-sm text-zinc-700">
                These are ballpark numbers for a single person renting in{" "}
                {city.label}, working full time, commuting about{" "}
                {commuteMinsPerDay} minutes per workday.
              </p>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60">
                <table className="w-full text-sm">
                  <tbody>
                    <Row
                      label="Net pay (after tax)"
                      value={netMonthly}
                      currency={currency}
                      strong
                    />
                    <Row label="Rent" value={housing} currency={currency} />
                    <Row
                      label="Bills & council tax"
                      value={bills}
                      currency={currency}
                    />
                    <Row
                      label="Commute costs"
                      value={commuteCost}
                      currency={currency}
                      note={`~${commuteMinsPerDay} mins/day`}
                    />
                    <Row
                      label="“Maintenance” & coping spends"
                      value={maintenance}
                      currency={currency}
                      note="social, food, work clothes, small treats"
                    />
                    <Row
                      label="Savings / pension"
                      value={savings}
                      currency={currency}
                    />
                    <tr className="border-t border-zinc-200 bg-white/80">
                      <td className="py-2 px-3 text-xs font-semibold text-zinc-700">
                        Estimated leftover
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-zinc-900">
                        {currency}
                        {leftover.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-zinc-600">
                This doesn&apos;t include every possible cost (groceries, pets,
                debt), but it captures the big things that tend to scale with
                income and location.
              </p>
            </section>

            {/* real cost of working explainer */}
            <section className="space-y-2 text-sm text-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900">
                Why this feels different from a normal salary calculator
              </h2>
              <p>
                Most calculators stop at tax and maybe rent. This estimate also
                bakes in the <strong>real cost of working</strong>: commute time
                and money, the extra spending you do to stay functional, and the
                fact that your job actually takes{" "}
                <strong>{totalHoursWeek.toFixed(1)} hours a week</strong> once
                you include travelling.
              </p>
              <p>
                That&apos;s why we look at your{" "}
                <strong>hour of freedom</strong> — how much truly discretionary
                money is left for every hour of life you pour into the job.
              </p>
            </section>

            {/* CTA to simulator */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-900">
                Try your exact numbers in the Real Cost Simulator
              </h2>
              <p className="text-sm text-zinc-700">
                Your own rent, commute and lifestyle might be very different
                from these defaults. The simulator lets you plug in:
              </p>
              <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                <li>Your actual rent (or house share)</li>
                <li>Your real commute minutes and how many days you go in</li>
                <li>Remote days, kids, debt, health and “maintenance” spends</li>
                <li>
                  And see how your <strong>hour of freedom</strong> changes when
                  you tweak them.
                </li>
              </ul>

              <a
                href={`/sim?region=UK&city=${encodeURIComponent(
                  city.label
                )}&gross=${salaryYear}`}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition"
              >
                Open this scenario in the Real Cost Simulator →
              </a>
            </section>

            {/* internal links */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                Explore nearby scenarios
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {neighbours.map((s) => (
                  <a
                    key={s}
                    href={`/enough/uk/${city.slug}/${s}`}
                    className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white/80 hover:border-rose-400 hover:text-rose-700 transition"
                  >
                    {`Is £${s.toLocaleString()} enough in ${city.label}?`}
                  </a>
                ))}
                {UK_CITIES.filter((c) => c.slug !== city.slug)
                  .slice(0, 3)
                  .map((c) => (
                    <a
                      key={c.slug}
                      href={`/enough/uk/${c.slug}/${salaryYear}`}
                      className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white/80 hover:border-sky-400 hover:text-sky-700 transition"
                    >
                      {`Same salary in ${c.label}`}
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

// ----- tiny presentational helpers -----
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

function Row({
  label,
  value,
  currency,
  strong,
  note,
}: {
  label: string;
  value: number;
  currency: string;
  strong?: boolean;
  note?: string;
}) {
  return (
    <tr className="border-b border-zinc-200 last:border-b-0">
      <td className="py-2 px-3 text-xs md:text-sm text-zinc-700">
        <div>{label}</div>
        {note && <div className="text-[11px] text-zinc-500">{note}</div>}
      </td>
      <td className="py-2 px-3 text-right text-sm">
        <span className={strong ? "font-semibold" : ""}>
          {currency}
          {value.toLocaleString()}
        </span>
      </td>
    </tr>
  );
}
