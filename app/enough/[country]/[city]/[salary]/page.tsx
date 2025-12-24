import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import EnoughClient from "@app/enough/EnoughClient";
import { UK_CITIES, approximateNetFromGrossUK } from "@app/cityConfig";

const BASE_URL = "https://www.real-cost-sim.com";

// ✅ 5k increments from 20k–60k (match EnoughClient)
export const SALARY_BANDS = [
  20000, 25000, 30000, 35000, 40000,
  45000, 50000, 55000, 60000,
];

export async function generateStaticParams() {
  return UK_CITIES.flatMap((city) =>
    SALARY_BANDS.map((salary) => ({
      country: "uk",
      city: city.slug,
      salary: String(salary),
    }))
  );
}

type Props = {
  params: {
    country?: string;
    city?: string;
    salary?: string;
  };
};

function labelFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function parseSalary(raw?: string) {
  if (!raw) return 0;
  const cleaned = decodeURIComponent(raw).replace(/[^0-9]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function nearestBand(n: number) {
  if (!n) return SALARY_BANDS[0];
  if (SALARY_BANDS.includes(n)) return n;

  let best = SALARY_BANDS[0];
  let bestDiff = Math.abs(n - best);
  for (const b of SALARY_BANDS) {
    const diff = Math.abs(n - b);
    if (diff < bestDiff) {
      best = b;
      bestDiff = diff;
    }
  }
  return best;
}

export function generateMetadata({ params }: Props): Metadata {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = params.city?.toLowerCase();
  const salaryRaw = parseSalary(params.salary);

  // If city missing/invalid, give generic meta (don’t lie, don’t London-default)
  if (!citySlug) {
    return {
      title: "Is this salary enough? | Real Cost Simulator",
      description:
        "Check whether your salary is enough after rent, bills and commuting in major UK cities.",
      alternates: { canonical: `${BASE_URL}/enough` },
      robots: { index: true, follow: true },
    };
  }

  const city = UK_CITIES.find((c) => c.slug.toLowerCase() === citySlug);
  if (!city) {
    return {
      title: "Is this salary enough? | Real Cost Simulator",
      description:
        "Check whether your salary is enough after rent, bills and commuting in major UK cities.",
      alternates: { canonical: `${BASE_URL}/enough` },
      robots: { index: true, follow: true },
    };
  }

  // Canonicalize salary to nearest supported band
  const salaryNum = nearestBand(salaryRaw || 28000);
  const cityLabel = city.label;

  const net = approximateNetFromGrossUK(salaryNum);
  const netMonthly = Math.round(net / 12);

  const title = `Is £${salaryNum.toLocaleString("en-GB")} enough to live in ${cityLabel}? | Real Cost Simulator`;
  const description = `${cityLabel} salary sense-check: someone earning £${salaryNum.toLocaleString(
    "en-GB"
  )} takes home about £${netMonthly.toLocaleString(
    "en-GB"
  )} per month (roughly). See if that leaves enough to live comfortably.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/enough/${country}/${citySlug}/${salaryNum}/`,
    },
    robots: { index: true, follow: true },
  };
}

export default function EnoughSalaryCityPage({ params }: Props) {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = params.city?.toLowerCase();

  // If no city, go to hub
  if (!citySlug) redirect("/enough");

  // If invalid city slug, go to hub (don’t 404)
  const city = UK_CITIES.find((c) => c.slug.toLowerCase() === citySlug);
  if (!city) redirect("/enough");

  const salaryRaw = parseSalary(params.salary);
  const salaryNum = nearestBand(salaryRaw || 28000);

  // If user hits a non-band salary (or weird), snap to a clean pSEO URL
  if (String(salaryNum) !== String(params.salary)) {
    redirect(`/enough/${country}/${citySlug}/${salaryNum}/`);
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        <EnoughClient />
      </Suspense>
    </main>
  );
}
