
// app/enough/cityConfig.ts

export type CountryCode = "uk";

export type CitySlug =
  | "london"
  | "manchester"
  | "birmingham"
  | "bristol"
  | "leeds"
  | "glasgow"
  | "edinburgh";

export interface CityConfig {
  slug: CitySlug;
  label: string;
  country: CountryCode;
  currency: string;
  typicalRentSingle: number;   // monthly, one-bed or decent room
  typicalBills: number;        // energy + council tax share
  typicalCommuteCost: number;  // monthly
  typicalCommuteMins: number;  // there & back per workday
}

export const UK_CITIES: CityConfig[] = [
  {
    slug: "london",
    label: "London",
    country: "uk",
    currency: "£",
    typicalRentSingle: 1400,
    typicalBills: 180,
    typicalCommuteCost: 180,
    typicalCommuteMins: 70,
  },
  {
    slug: "manchester",
    label: "Manchester",
    country: "uk",
    currency: "£",
    typicalRentSingle: 950,
    typicalBills: 150,
    typicalCommuteCost: 120,
    typicalCommuteMins: 50,
  },
    {
    slug: "birmingham",
    label: "Birmingham",
    country: "uk",
    currency: "£",
    typicalRentSingle: 900,
    typicalBills: 150,
    typicalCommuteCost: 110,
    typicalCommuteMins: 50,
  },
  {
    slug: "bristol",
    label: "Bristol",
    country: "uk",
    currency: "£",
    typicalRentSingle: 1000,
    typicalBills: 150,
    typicalCommuteCost: 110,
    typicalCommuteMins: 50,
  },
  {
    slug: "leeds",
    label: "Leeds",
    country: "uk",
    currency: "£",
    typicalRentSingle: 850,
    typicalBills: 140,
    typicalCommuteCost: 100,
    typicalCommuteMins: 45,
  },
  {
    slug: "glasgow",
    label: "Glasgow",
    country: "uk",
    currency: "£",
    typicalRentSingle: 800,
    typicalBills: 140,
    typicalCommuteCost: 90,
    typicalCommuteMins: 45,
  },
  {
    slug: "edinburgh",
    label: "Edinburgh",
    country: "uk",
    currency: "£",
    typicalRentSingle: 950,
    typicalBills: 150,
    typicalCommuteCost: 100,
    typicalCommuteMins: 45,
  },
];

export const UK_SALARY_BANDS: number[] = [
  22000,
  25000,
  28000,
  30000,
  32000,
  35000,
  40000,
  45000,
  50000,
  60000,
  70000,
];

// very rough net pay factor for UK – you can improve this later
export function approximateNetFromGrossUK(grossYear: number): number {
  const effectiveRate =
    grossYear <= 30000 ? 0.78 : grossYear <= 50000 ? 0.75 : 0.70;
  return Math.round((grossYear * effectiveRate) / 12);
}
