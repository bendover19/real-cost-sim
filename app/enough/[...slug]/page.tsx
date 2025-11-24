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

// --------- helper: find city ----------
function getCityFromSlug(citySlug: string | undefined): CityConfig | null {
  if (!citySlug) return null;
  const slug = citySlug.toLowerCase();
  return UK_CITIES.find((c) => c.slug.toLowerCase() === slug) ?? null;
}

// --------- helper: parse params into pieces ----------
function parseSlug(params: Params) {
  const [country, city, salaryStr] = params.slug ?? [];
  const salaryYear = Number(salaryStr);
  return {
    country: country ?? "uk",
    citySlug: city,
    salaryYear: Number.isFinite(salaryYear) ? salaryYear : 0,
  };
}

// --------- generateStaticParams ----------
export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const city of UK_CITIES) {
    for (const salary of UK_SALARY_BANDS) {
      params.push({
        slug: ["uk", city.slug, String(salary)],
      });
    }
  }
  return params;
}

// --------- metadata ----------
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

  const title = `Is £${salaryYear.toLocaleString()} enough to live in ${city.label}?`;
  const description = `A realistic leftover-money breakdown for someone earning £${salaryYear.toLocaleString()} in ${city.label}, after rent, commute and the real cost of working.`;

  return { title, description };
}

// --------- tiny helper ----------
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

// --------- the page ----------
export default function Page({ params }: { params: Params }) {
  const { country, citySlug, salaryYear } = parseSlug(params);
  const city = getCityFromSlug(citySlug);

  // DEBUG STRIP – REMOVE LATER
  const debugParams = JSON.stringify(params);

  const cityOrFallback =
    city ??
    ({
      slug: citySlug ?? "unknown",
      label: citySlug ?? "this city",
      country: (country as any) ?? "uk",
      currency: "£",
      typicalRentSingle: 1000,
      typicalBills: 150,
      typicalCommuteCost: 120,
      typicalCommuteMins: 60,
    } as CityConfig);

  const safeSalary = salaryYear || 0;

  const netMonthly = approximateNetFromGrossUK(safeSalary);
  const housing = cityOrFallback.typicalRentSingle;
  const bills = cityOrFallback.typicalBills;
  const commuteCost = cityOrFallback.typicalCommuteCost;
  const commuteMinsPerDay = cityOrFallback.typicalCommuteMins;

  const maintenance = Math.round(netMonthly * 0.2);
  const savings = Math.round(netMonthly * 0.08);
  const otherFixed = 0;

  const totalCosts =
    housing + bills + commuteCost + maintenance + savings + otherFixed;
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
  const niceSalary = `£${safeSalary.toLocaleString()}`;

  const neighbours = UK_SALARY_BANDS.filter(
    (s) => Math.abs(s - safeSalary) <= 10000 && s !== safeSalary
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-amber-50">
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">

            {/* DEBUG SECTION */}
            <div className="text-[11px] text-zinc
