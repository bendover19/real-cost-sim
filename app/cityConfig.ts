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
  | "southampton";
  | "portsmouth";
  | "leicester";
  | "coventry";
  | "derby";
  | "stoke";
  | "plymouth";
  | "norwich";
  | "swansea";
  | "bornemouth";
  | "milton-keynes";
  | "reading";
  | "luton";
  | "wolverhampton";
  | "hull";

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
  {
  slug: "southampton",
  label: "Southampton",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 950,
  typicalBills: 160,
  typicalCommuteCost: 140,
  typicalCommuteMins: 55,
},
{
  slug: "portsmouth",
  label: "Portsmouth",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 900,
  typicalBills: 155,
  typicalCommuteCost: 135,
  typicalCommuteMins: 55,
},
{
  slug: "leicester",
  label: "Leicester",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 850,
  typicalBills: 150,
  typicalCommuteCost: 130,
  typicalCommuteMins: 50,
},
{
  slug: "coventry",
  label: "Coventry",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 850,
  typicalBills: 150,
  typicalCommuteCost: 135,
  typicalCommuteMins: 55,
},
{
  slug: "derby",
  label: "Derby",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 800,
  typicalBills: 150,
  typicalCommuteCost: 120,
  typicalCommuteMins: 50,
},
{
  slug: "stoke",
  label: "Stoke-on-Trent",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 700,
  typicalBills: 140,
  typicalCommuteCost: 115,
  typicalCommuteMins: 45,
},
{
  slug: "plymouth",
  label: "Plymouth",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 750,
  typicalBills: 145,
  typicalCommuteCost: 120,
  typicalCommuteMins: 45,
},
{
  slug: "norwich",
  label: "Norwich",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 850,
  typicalBills: 150,
  typicalCommuteCost: 130,
  typicalCommuteMins: 55,
},
{
  slug: "swansea",
  label: "Swansea",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 700,
  typicalBills: 135,
  typicalCommuteCost: 115,
  typicalCommuteMins: 45,
},
{
  slug: "bournemouth",
  label: "Bournemouth",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 1000,
  typicalBills: 160,
  typicalCommuteCost: 140,
  typicalCommuteMins: 55,
},
{
  slug: "milton-keynes",
  label: "Milton Keynes",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 1000,
  typicalBills: 160,
  typicalCommuteCost: 150,
  typicalCommuteMins: 60,
},
{
  slug: "reading",
  label: "Reading",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 1100,
  typicalBills: 165,
  typicalCommuteCost: 160,
  typicalCommuteMins: 60,
},
{
  slug: "luton",
  label: "Luton",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 950,
  typicalBills: 155,
  typicalCommuteCost: 145,
  typicalCommuteMins: 55,
},
{
  slug: "wolverhampton",
  label: "Wolverhampton",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 750,
  typicalBills: 145,
  typicalCommuteCost: 120,
  typicalCommuteMins: 50,
},
{
  slug: "hull",
  label: "Hull",
  country: "uk",
  currency: "GBP",
  typicalRentSingle: 650,
  typicalBills: 135,
  typicalCommuteCost: 110,
  typicalCommuteMins: 45,
},

];

// salary bands used for generateStaticParams – tweak as you like
export const UK_SALARY_BANDS: number[] = [
  18000,
  20000,
  22000,
  24000,
  25000,
  26000,
  28000,
  29000,
  30000,
  32000,
  33000,
  34000,
  35000,
  36000,
  37000,
  38000,
  39000,
  40000,
  41000,
  42000,
  43000,
  44000,
  45000,
  46000,
  47000,
  48000,
  49000,
  50000,
  51000,
  52000,
  53000,
  54000,
  55000,
  56000,
  57000,
  58000,
  59000,
  60000,
  70000,
  80000
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
