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
  | "oxford"
  // new ones below
  | "southampton"
  | "portsmouth"
  | "leicester"
  | "coventry"
  | "derby"
  | "stoke"
  | "plymouth"
  | "norwich"
  | "swansea"
  | "bournemouth"
  | "milton-keynes"
  | "reading"
  | "luton"
  | "wolverhampton"
  | "hull";

export interface CityConfig {
  slug: CitySlug;
  label: string;
  country: CountryCode;
  currency: string;
  typicalRentSingle: number;   // £/month, 1-bed / room
  typicalBills: number;        // £/month, utilities + council tax share
  typicalCommuteCost: number;  // £/month, travelcard / fuel etc.
  typicalCommuteMins: number;  // minutes/day (there & back)
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

  // --- new 15 cities ---

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

export function generateCityDescription(city: CityConfig): string {
  return `
${city.label} has a typical monthly rent of around £${city.typicalRentSingle}, 
with average bills of about £${city.typicalBills}. Combined with commute 
costs of roughly £${city.typicalCommuteCost} per month and a daily commute 
time of about ${city.typicalCommuteMins} minutes, ${city.label} tends to be 
${city.typicalRentSingle > 1000 ? "one of the pricier" : "a relatively affordable"} 
UK cities for single renters. 

Your take-home pay determines whether you’ll have breathing room or a tight month. 
Below you’ll find a breakdown showing how far a given salary stretches in ${city.label}, 
plus an option to test your exact situation in the full Real Cost Simulator.
  `.trim();
}


export const UK_SALARY_BANDS: number[] = [
  18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000,
  38000, 40000, 42000, 44000, 46000, 48000, 50000, 52000, 54000, 56000,
  58000, 60000, 62000, 64000, 66000, 68000, 70000, 72000, 74000, 76000,
  78000, 80000, 82000, 84000, 86000, 88000, 90000, 92000, 94000, 96000,
  98000, 100000, 102000, 104000, 106000, 108000, 110000, 112000, 114000, 116000,
  118000, 120000, 122000, 124000, 126000, 128000, 130000, 132000, 134000, 136000,
  138000, 140000, 142000, 144000, 146000, 148000, 150000, 152000, 154000, 156000,
  158000, 160000, 162000, 164000, 166000, 168000, 170000, 172000, 174000, 176000,
  178000, 180000, 182000, 184000, 186000, 188000, 190000, 192000, 194000, 196000,
  198000, 200000
];


// very rough UK net-pay approximation
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
    grossAnnual <= 12570 ? 0 : (grossAnnual - 12570) * 0.08; // very rough

  return Math.max(0, grossAnnual - tax - ni);
}
