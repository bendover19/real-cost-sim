import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "@app/enough/EnoughClient";
import {
  UK_CITIES,
  approximateNetFromGrossUK,
} from "@app/cityConfig";

const BASE_URL = "https://www.real-cost-sim.com";

// Salary bands we support
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
  params?: {
    country?: string;
    city?: string;
    salary?: string;
  };
};

export function generateMetadata({ params }: Props): Metadata {
  const country = (params?.country ?? "uk").toLowerCase();
  const citySlug = (params?.city ?? "london").toLowerCase();
  const salaryNum = Number(params?.salary ?? 28000);

  const city = UK_CITIES.find((c) => c.slug === citySlug);
  const cityLabel =
    city?.label ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const net = approximateNetFromGrossUK(salaryNum);
  const netMonthly = Math.round(net / 12);

  const title = `Is £${salaryNum.toLocaleString(
    "en-GB"
  )} enough to live in ${cityLabel}? | Real Cost Simulator`;

  const description = `${cityLabel} salary sense-check: with typical rent, bills and commute, someone earning £${salaryNum.toLocaleString(
    "en-GB"
  )} takes home about £${netMonthly.toLocaleString(
    "en-GB"
  )} per month. See if that leaves enough to live comfortably.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/enough/${country}/${citySlug}/${salaryNum}/`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function EnoughSalaryCityPage() {
  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        {/* EnoughClient will read the city and salary from the URL/path */}
        <EnoughClient />
      </Suspense>
    </main>
  );
}
