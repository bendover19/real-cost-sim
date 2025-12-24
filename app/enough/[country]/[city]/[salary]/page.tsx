import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import EnoughClient from "@app/enough/EnoughClient";
import { UK_CITIES, approximateNetFromGrossUK } from "@app/cityConfig";

const BASE_URL = "https://www.real-cost-sim.com";

// ✅ 5k increments from 20k–60k (must match EnoughClient)
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

function parseSalaryStrict(raw?: string) {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function generateMetadata({ params }: Props): Metadata {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = params.city?.toLowerCase();
  const salaryNum = parseSalaryStrict(params.salary);

  // ✅ No fallbacks here — if params are missing/invalid, do not pretend it's London
  if (!citySlug || !salaryNum) {
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

  // ✅ If salary isn't one of your supported bands, don't generate SEO for it
  if (!SALARY_BANDS.includes(salaryNum)) {
    return {
      title: `Is £${salaryNum.toLocaleString("en-GB")} enough? | Real Cost Simulator`,
      description:
        "This salary page isn’t available. Try a supported salary band from the city page.",
      alternates: { canonical: `${BASE_URL}/enough/${country}/${citySlug}/` },
      robots: { index: false, follow: true }, // important: don't index invalid salaries
    };
  }

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
  const salaryNum = parseSalaryStrict(params.salary);

  if (!citySlug || !salaryNum) notFound();

  const city = UK_CITIES.find((c) => c.slug.toLowerCase() === citySlug);
  if (!city) notFound();

  // ✅ Strict: only allow known salary bands (prevents broken pSEO URLs)
  if (!SALARY_BANDS.includes(salaryNum)) notFound();

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        {/* EnoughClient reads country/city/salary from the path */}
        <EnoughClient />
      </Suspense>
    </main>
  );
}
