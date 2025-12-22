// app/enough/EnoughBreadcrumbJsonLd.tsx
import { UK_CITIES } from "@app/cityConfig";

const BASE_URL = "https://www.real-cost-sim.com";

type Props = {
  country?: string;
  citySlug?: string;
  salary?: string | number;
};

export default function EnoughBreadcrumbJsonLd({ country, citySlug, salary }: Props) {
  const crumbs: { name: string; item: string }[] = [
    { name: "Home", item: `${BASE_URL}/` },
    { name: "Is this salary enough?", item: `${BASE_URL}/enough` },
  ];

  const countrySlug = country?.toLowerCase();
  const citySlugSafe = citySlug?.toLowerCase();

  // Since /enough is your UK hub (and /enough/uk redirects to it), skip a UK crumb.
  if (countrySlug && countrySlug !== "uk") {
    crumbs.push({
      name: countrySlug.toUpperCase(),
      item: `${BASE_URL}/enough/${countrySlug}`,
    });
  }

  if (countrySlug && citySlugSafe) {
    const city = UK_CITIES.find((c) => c.slug.toLowerCase() === citySlugSafe);
    const cityLabel =
      city?.label ?? citySlugSafe.charAt(0).toUpperCase() + citySlugSafe.slice(1);

    crumbs.push({
      name: cityLabel,
      item: `${BASE_URL}/enough/${countrySlug}/${citySlugSafe}`,
    });
  }

  const salaryNumber =
    typeof salary === "string" ? Number(salary) : typeof salary === "number" ? salary : undefined;

  if (countrySlug && citySlugSafe && salaryNumber && Number.isFinite(salaryNumber)) {
    crumbs.push({
      name: `£${salaryNumber.toLocaleString("en-GB")} salary`,
      item: `${BASE_URL}/enough/${countrySlug}/${citySlugSafe}/${salaryNumber}`,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
