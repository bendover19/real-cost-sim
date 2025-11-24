// app/cityConfig.ts

export type CountryCode = "uk";

export type CitySlug =
  | "london"
  | "manchester"
  | "birmingham"
  | "leeds"
  | "glasgow"
  | "edinburgh"
  | "bristol"
  | "liverpool"
  | "nottingham"
  | "sheffield"
  | "cardiff"
  | "newcastle"
  | "brighton"
  | "cambridge"
  | "oxford";

export interface CityConfig {
  slug: CitySlug;
  label: string;
  country: CountryCode;
  currency: string;
  typicalRentSingle: number;   // £/month
  typicalBills: number;        // £/month
  typicalCommuteCost: number;  // £/month
  typicalCommuteMins: number;  // minutes/day
}

export const UK_CITIES: CityConfig[] = [
  {
    slug: "london",
    label: "London",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 1400,
    typicalBills: 180,
    typicalCommuteCost: 180,
    typicalCommuteMins: 70,
  },
  {
    slug: "manchester",
    label: "Manchester",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 950,
    typicalBills: 160,
    typicalCommuteCost: 150,
    typicalCommuteMins: 60,
  },
  {
    slug: "birmingham",
    label: "Birmingham",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 900,
    typicalBills: 150,
    typicalCommuteCost: 140,
    typicalCommuteMins: 60,
  },
  {
    slug: "leeds",
    label: "Leeds",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 850,
    typicalBills: 150,
    typicalCommuteCost: 130,
    typicalCommuteMins: 55,
  },
  {
    slug: "glasgow",
    label: "Glasgow",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 800,
    typicalBills: 150,
    typicalCommuteCost: 130,
    typicalCommuteMins: 50,
  },
  {
    slug: "edinburgh",
    label: "Edinburgh",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 950,
    typicalBills: 170,
    typicalCommuteCost: 150,
    typicalCommuteMins: 55,
  },
  {
    slug: "bristol",
    label: "Bristol",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 1000,
    typicalBills: 170,
    typicalCommuteCost: 150,
    typicalCommuteMins: 55,
  },
  {
    slug: "liverpool",
    label: "Liverpool",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 800,
    typicalBills: 140,
    typicalCommuteCost: 120,
    typicalCommuteMins: 50,
  },
  {
    slug: "nottingham",
    label: "Nottingham",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 800,
    typicalBills: 140,
    typicalCommuteCost: 120,
    typicalCommuteMins: 45,
  },
  {
    slug: "sheffield",
    label: "Sheffield",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 780,
    typicalBills: 140,
    typicalCommuteCost: 110,
    typicalCommuteMins: 45,
  },
  {
    slug: "cardiff",
    label: "Cardiff",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 800,
    typicalBills: 145,
    typicalCommuteCost: 120,
    typicalCommuteMins: 45,
  },
  {
    slug: "newcastle",
    label: "Newcastle",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 780,
    typicalBills: 140,
    typicalCommuteCost: 115,
    typicalCommuteMins: 45,
  },
  {
    slug: "brighton",
    label: "Brighton",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 1100,
    typicalBills: 170,
    typicalCommuteCost: 150,
    typicalCommuteMins: 55,
  },
  {
    slug: "cambridge",
    label: "Cambridge",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 1100,
    typicalBills: 170,
    typicalCommuteCost: 150,
    typicalCommuteMins: 50,
  },
  {
    slug: "oxford",
    label: "Oxford",
    country: "uk",
    currency: "GBP",
    typicalRentSingle: 1100,
    typicalBills: 170,
    typicalCommuteCost: 150,
    typicalCommuteMins: 50,
  },
];

// salary bands used for generateStaticParams – tweak as you like
export const UK_SALARY_BANDS: number[] = [
  18000,
  20000,
  22000,
  24000,
  26000,
  28000,
  30000,
  32000,
  35000,
  38000,
  40000,
  45000,
  50000,
];

// super simple UK net-pay approximation – keep your existing one if you prefer
export function approximateNetFromGrossUK(grossAnnual: number): number {
  if (!grossAnnual || !Number.isFinite(grossAnnual)) return 0;

  const personalAllowance = 12570;
  const basicRateLimit = 50270;
  const higherRateLimit = 125140;

  let taxable = Math.max(0, grossAnnual - personalAllowance);
  let tax = 0;

  if (taxable > 0) {
    const basicBand = Math.min(taxable, basicRateLimit - personalAllowance);
    tax += basicBand * 0.2;
    taxable -= basicBand;
  }

  if (taxable > 0) {
    const higherBand = Math.min(taxable, higherRateLimit - basicRateLimit);
    tax += higherBand * 0.4;
    taxable -= higherBand;
  }

  if (taxable > 0) {
    tax += taxable * 0.45;
  }

  const ni =
    grossAnnual <= 12570
      ? 0
      : (grossAnnual - 12570) * 0.08; // very rough

  return Math.max(0, grossAnnual - tax - ni);
}
