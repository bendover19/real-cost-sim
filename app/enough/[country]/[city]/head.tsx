import { UK_CITIES } from "@app/cityConfig";

const BASE_URL = "https://www.real-cost-sim.com";

type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

export default function Head({ params }: Props) {
  const country = (params.country ?? "uk").toLowerCase();
  const citySlug = params.city?.toLowerCase();

  if (!citySlug) return null;

  const city = UK_CITIES.find((c) => c.slug === citySlug);
  if (!city) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is £28,000 enough to live in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `As a rough guide, £28,000 a year in ${city.label} can cover typical rent, bills and commute for a single renter, but how comfortable it feels depends on your lifestyle and other costs.`,
        },
      },
      {
        "@type": "Question",
        name: `What is a typical monthly rent in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A simple benchmark for ${city.label} is around £${city.typicalRentSingle.toLocaleString(
            "en-GB"
          )} per month for a one-bed or room, though prices vary by area.`,
        },
      },
      {
        "@type": "Question",
        name: `How much are bills and council tax in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For a single renter in ${city.label}, a reasonable starting point is about £${city.typicalBills.toLocaleString(
            "en-GB"
          )} per month for utilities and council tax.`,
        },
      },
      {
        "@type": "Question",
        name: `What are typical commute costs in ${city.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Real Cost Simulator assumes around £${city.typicalCommuteCost.toLocaleString(
            "en-GB"
          )} per month in commute costs for ${city.label}, depending on distance and transport.`,
        },
      },
    ],
  };

  return (
    <>
      {/* Optional: explicit canonical in head */}
      <link
        rel="canonical"
        href={`${BASE_URL}/enough/${country}/${citySlug}/`}
      />

      {/* ✅ FAQ JSON-LD will now be in server HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
