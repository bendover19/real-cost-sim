// app/enough/[country]/[city]/[salary]/page.tsx

import type { Metadata } from "next";
import EnoughPage from "../../../page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  country: string;
  city: string;
  salary: string;
};

// Simple dynamic metadata so each pretty URL has a nice title/description
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { city, salary } = params;

  const salaryNum = Number(
    decodeURIComponent(salary).replace(/[^0-9]/g, "")
  );

  const salaryPretty = Number.isFinite(salaryNum)
    ? salaryNum.toLocaleString("en-GB", { maximumFractionDigits: 0 })
    : salary;

  const cityPretty =
    city.slice(0, 1).toUpperCase() + city.slice(1).toLowerCase();

  return {
    title: `Is £${salaryPretty} enough to live in ${cityPretty}?`,
    description: `Rough estimate of whether a £${salaryPretty} salary is enough to live in ${cityPretty}, after typical rent, bills and commute costs.`,
  };
}

export default function EnoughPrettyPage({
  params,
}: {
  params: Params;
}) {
  const { country, city, salary } = params;

  // Build the same shape that /app/enough/page.tsx expects
  const searchParams = {
    country,
    city,
    salary,
  };

  // Re-use the existing server component so the numbers stay identical
  return <EnoughPage searchParams={searchParams} />;
}
