// app/enough/[country]/[city]/[salary]/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../../EnoughClient";
import { UK_CITIES, UK_SALARY_BANDS } from "../../../cityConfig";

type Params = {
  country: string;
  city: string;
  salary: string;
};

// --- Tell Next which static pages to build (pSEO core) ---
export function generateStaticParams() {
  const country = "uk";

  return UK_CITIES.flatMap((city) =>
    UK_SALARY_BANDS.map((salary) => ({
      country,
      city: city.slug,
      salary: String(salary),
    }))
  );
}

// --- Per-page <title> and <meta> using city + salary ---
export function generateMetadata(
  { params }: { params: Params }
): Metadata {
  const { city, salary } = params;

  const cityConfig = UK_CITIES.find((c) => c.slug === city);
  const cityLabel = cityConfig?.label ?? city;
  const salaryNumber = Number(salary);

  const salaryPretty = Number.isFinite(salaryNumber)
    ? `£${salaryNumber.toLocaleString("en-GB")}`
    : "this salary";

  const title = `Is ${salaryPretty} enough to live in ${cityLabel}?`;
  const description = `Rough estimate of whether a salary of ${salaryPretty} is enough to live in ${cityLabel} in the UK, after typical rent, bills and commute costs.`;

  const url = `https://www.real-cost-sim.com/enough/uk/${city}/${salary}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
  };
}

// --- Page that actually renders the client calculator ---
export default function EnoughPrettyPage() {
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
