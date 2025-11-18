"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
/*import html2canvas from "html2canvas";*/

/* ============================================================
   Real Cost Simulator — page.tsx
   - Sliders unchanged
   - Text inputs are "sticky" (uncontrolled) so focus never jumps
   - Sections render once and are hidden/shown (no remounts)
   - Chart toggle for Typical local month vs Your month
   - Checkbox to include/exclude Other income in chart total
   - Commute time slider powers both commute cost & time logic
   ============================================================ */

const INGEST_PATH = "/api/ingest";

/** ----------------------------------------------------------------
 * Smooth, mobile-friendly range input (UNCHANGED)
 * ---------------------------------------------------------------- */
const InputRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onInput"> & {
    value: number;
    onValue: (n: number) => void;
    live?: boolean;
    throttleMs?: number;
  }
> = ({ value, onValue, live = false, throttleMs = 60, ...rest }) => {
  const [inner, setInner] = React.useState<number>(value ?? 0);
  const tRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setInner(value ?? 0);
  }, [value]);

  const commit = React.useCallback((n: number) => onValue(n), [onValue]);

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const n = Number((e.currentTarget as HTMLInputElement).value);
    setInner(n);
    if (live) {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        commit(n);
        tRef.current = null;
      }, throttleMs);
    }
  };

  const onPointerUp = () => {
    if (!live) commit(inner);
  };

  return (
    <input
      type="range"
      {...rest}
      value={inner}
      onInput={onInput}
      onChange={() => {}}
      onPointerUp={onPointerUp}
      onMouseUp={onPointerUp}
      onTouchEnd={onPointerUp}
      style={{ touchAction: "pan-y" }}
    />
  );
};

// ---------- Types ----------
type RegionId = "UK" | "EU" | "US" | "OTHER";
type Household = "solo" | "partner" | "partnerKids" | "singleParent" | "share" | "family";
type DriverKey = "belonging" | "identity" | "timeTrade" | "comfort" | "connection" | "treats" | "moneyPressure";
type SpendKey = "pet" | "therapy" | "supportOthers" | "health";
type Urbanicity = "inner" | "city" | "suburban" | "rural";
type CommuteContext = "transitEfficient" | "mixed" | "carDependent";
type ChildAge = "nursery" | "school";
type HealthPlanUS = "employer" | "market" | "none";

interface Region {
  id: RegionId;
  label: string;
  currency: string;
  commutePT: number;
  commuteDrive: number;
}

// ---------- Tables ----------
const regions: Region[] = [
  { id: "UK", label: "United Kingdom", currency: "£", commutePT: 180, commuteDrive: 260 },
  { id: "EU", label: "European Union", currency: "€", commutePT: 120, commuteDrive: 190 },
  { id: "US", label: "United States", currency: "$", commutePT: 110, commuteDrive: 220 },
  { id: "OTHER", label: "Other / OECD", currency: "$", commutePT: 100, commuteDrive: 180 },
];

const URBANICITY: Record<Urbanicity, { label: string; rentMul: number; commuteMul: number }> = {
  inner: { label: "Inner-city core", rentMul: 1.5, commuteMul: 1.1 },
  city: { label: "City / metro", rentMul: 1.2, commuteMul: 1.0 },
  suburban: { label: "Suburban", rentMul: 1.0, commuteMul: 1.1 },
  rural: { label: "Rural / small town", rentMul: 0.85, commuteMul: 1.2 },
};

const COMMUTE_CTX: Record<CommuteContext, { label: string; commuteMul: number }> = {
  transitEfficient: { label: "Transit-efficient city", commuteMul: 1.0 },
  mixed: { label: "Mixed options", commuteMul: 1.1 },
  carDependent: { label: "Car-dependent city", commuteMul: 1.3 },
};

// Typical monthly amounts for driver categories (anchors for defaults)
const DRIVER_TYPICAL: Record<DriverKey, number> = {
  belonging: 140,
  identity: 110,
  timeTrade: 120,
  comfort: 90,
  connection: 120,
  treats: 45,
  moneyPressure: 25,
};

// UI meta for drivers
const DRIVER_META: Record<DriverKey, { emoji: string; title: string; sub: string; color: string }> = {
  belonging: { emoji: "🫶", title: "Belonging", sub: "Not being the ghost at work or with friends", color: "rose" },
  identity: { emoji: "👔", title: "Identity", sub: "Looking like you belong where you work", color: "violet" },
  timeTrade: { emoji: "⏱️", title: "Time trade", sub: "When tired, you buy time (delivery, taxis)", color: "amber" },
  comfort: { emoji: "🌙", title: "Comfort", sub: "Things that make life more pleasant or restorative (home upgrades, wine, spa day)", color: "sky" },
  connection: { emoji: "💘", title: "Connection", sub: "Dating / keeping relationships alive", color: "fuchsia" },
  treats: { emoji: "🎁", title: "Small treats", sub: "Subscriptions and little upgrades", color: "emerald" },
  moneyPressure: { emoji: "💸", title: "Money pressure", sub: "BNPL/overdraft to smooth the month", color: "orange" },
};

// Wide slider limits per driver
const DRIVER_LIMITS: Record<DriverKey, { min: number; max: number; step: number }> = {
  belonging: { min: 0, max: 800, step: 5 },
  identity: { min: 0, max: 800, step: 5 },
  timeTrade: { min: 0, max: 1200, step: 5 },
  comfort: { min: 0, max: 600, step: 5 },
  connection: { min: 0, max: 1200, step: 5 },
  treats: { min: 0, max: 400, step: 5 },
  moneyPressure: { min: 0, max: 300, step: 5 },
};

// Slider limits for variable spends
const SPEND_LIMITS: Record<SpendKey, { label: string; min: number; max: number; step: number }> = {
  pet: { label: "🐾 Pet costs (food, insurance, sitter/boarding, horse, etc.)", min: 0, max: 2000, step: 10 },
  therapy: { label: "🧠 Therapy / coaching / counselling", min: 0, max: 2000, step: 10 },
  supportOthers: { label: "🤝 Support others (family remit, gifts, obligations)", min: 0, max: 3000, step: 10 },
  health: { label: "💊 Health costs (meds, dental, vision, non-insurance)", min: 0, max: 2000, step: 10 },
};

const RENT_TABLE: Record<RegionId, Record<Household, number>> = {
  UK: { solo: 1200, partner: 1600, partnerKids: 1900, singleParent: 1500, share: 800, family: 0 },
  EU: { solo: 900, partner: 1200, partnerKids: 1500, singleParent: 1100, share: 600, family: 0 },
  US: { solo: 1300, partner: 1700, partnerKids: 2100, singleParent: 1600, share: 850, family: 0 },
  OTHER: { solo: 800, partner: 1100, partnerKids: 1300, singleParent: 900, share: 500, family: 0 },
};

// ---------- Relocation cities (approximate typical costs, GBP-equivalent) ----------
type RelocationCityId =
  | "lisbon"
  | "bali"
  | "mexico_city"
  | "chiang_mai"
  | "valencia"
  | "istanbul"
  | "melbourne"
  | "tbilisi";

interface RelocationCity {
  id: RelocationCityId;
  label: string;
  shortLabel: string;
  country: string;
  rent: number;
  childcare: number;
  commute: number;
  lifestyleScore: number;
  remoteScore: number;
  avgCommuteMinutes: number;
}

const RELOCATION_CITIES: RelocationCity[] = [
  {
    id: "lisbon",
    label: "Lisbon (Portugal)",
    shortLabel: "Lisbon",
    country: "Portugal",
    rent: 1100,
    childcare: 350,
    commute: 70,
    lifestyleScore: 8,
    remoteScore: 8,
    avgCommuteMinutes: 50,
  },
  {
    id: "bali",
    label: "Bali",
    shortLabel: "Bali",
    country: "Indonesia",
    rent: 750,
    childcare: 220,
    commute: 40,
    lifestyleScore: 9,
    remoteScore: 9,
    avgCommuteMinutes: 30,
  },
  {
    id: "mexico_city",
    label: "Mexico City (Mexico)",
    shortLabel: "Mexico City",
    country: "Mexico",
    rent: 900,
    childcare: 280,
    commute: 60,
    lifestyleScore: 7,
    remoteScore: 7,
    avgCommuteMinutes: 60,
  },
  {
    id: "chiang_mai",
    label: "Chiang Mai (Thailand)",
    shortLabel: "Chiang Mai",
    country: "Thailand",
    rent: 650,
    childcare: 200,
    commute: 35,
    lifestyleScore: 9,
    remoteScore: 8,
    avgCommuteMinutes: 30,
  },
  {
    id: "valencia",
    label: "Valencia (Spain)",
    shortLabel: "Valencia",
    country: "Spain",
    rent: 900,
    childcare: 320,
    commute: 55,
    lifestyleScore: 8,
    remoteScore: 7,
    avgCommuteMinutes: 45,
  },
  {
    id: "istanbul",
    label: "Istanbul (Turkey)",
    shortLabel: "Istanbul",
    country: "Turkey",
    rent: 750,
    childcare: 230,
    commute: 50,
    lifestyleScore: 7,
    remoteScore: 6,
    avgCommuteMinutes: 55,
  },
  {
    id: "melbourne",
    label: "Melbourne (Australia)",
    shortLabel: "Melbourne",
    country: "Australia",
    rent: 1650,
    childcare: 400,
    commute: 90,
    lifestyleScore: 8,
    remoteScore: 8,
    avgCommuteMinutes: 70,
  },
  {
    id: "tbilisi",
    label: "Tbilisi (Georgia)",
    shortLabel: "Tbilisi",
    country: "Georgia",
    rent: 650,
    childcare: 210,
    commute: 40,
    lifestyleScore: 8,
    remoteScore: 8,
    avgCommuteMinutes: 35,
  },
];

// ---------- Utils ----------
function currencySymbol(regionId: RegionId) {
  const r = regions.find((rr) => rr.id === regionId);
  return r ? r.currency : "£";
}
function suggestedHousing(regionId: RegionId, household: Household) {
  const byRegion = RENT_TABLE[regionId] || RENT_TABLE.OTHER;
  const v = byRegion[household];
  return typeof v === "number" ? v : RENT_TABLE.OTHER.solo;
}
function childCostPreset(regionId: RegionId, count: number, age: ChildAge) {
  if (count <= 0) return 0;
  const base = regionId === "UK" ? 400 : regionId === "EU" ? 300 : regionId === "US" ? 500 : 280;
  const ageMul = age === "nursery" ? 1.5 : 1.0;
  const kidsAdj = count === 1 ? 1 : count === 2 ? 1.9 : 2.6;
  return Math.round(base * ageMul * kidsAdj);
}
function approximateFromGross(regionId: RegionId, grossMonthly: number) {
  const effRate = regionId === "US" ? 0.78 : regionId === "UK" ? 0.75 : regionId === "EU" ? 0.77 : 0.76;
  return Math.round(grossMonthly * effRate);
}
function computeHealthcareUS(plan: HealthPlanUS) {
  return plan === "employer" ? 200 : plan === "market" ? 450 : 150;
}
function computeHealthcare(regionId: RegionId, plan: HealthPlanUS | null, override: number) {
  if (regionId !== "US") return 0;
  const base = plan ? computeHealthcareUS(plan) : 250;
  return Math.max(0, override > 0 ? override : base);
}
function computeSavingsFromRate(netMonthly: number, ratePct: number) {
  return Math.round((netMonthly * Math.max(0, Math.min(100, ratePct))) / 100);
}
function toNumberSafe(v: string): number {
  if ((v as any)?.trim) {
    if (v.trim() === "" || v === "-") return 0;
  }
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ---------- Small primitives ----------
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur ${className || ""}`}>{children}</div>
);
const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-5 ${className || ""}`}>{children}</div>
);

// Money now supports optional clamping (default true)
const Money: React.FC<{ value: number; currency: string; clampZero?: boolean }> = ({ value, currency, clampZero = true }) => {
  const v = clampZero ? Math.max(0, value) : value;
  return (
    <span className="tabular-nums font-semibold">
      {currency}
      {v.toLocaleString()}
    </span>
  );
};

// ---------- Chart ----------
function BarChart({
  currency,
  net,
  housing,
  commute,
  maintenance,
  dependents,
  healthcare,
  debt,
  savings,
}: {
  currency: string;
  net: number;
  housing: number;
  commute: number;
  maintenance: number;
  dependents: number;
  healthcare: number;
  debt: number;
  savings: number;
}) {
  const safeNet = Math.max(1, net);
  const slices = [
    { label: "Housing", value: housing, color: "bg-rose-500" },
    { label: "Commute", value: commute, color: "bg-orange-500" },
    { label: "Dependents", value: dependents, color: "bg-indigo-500" },
    { label: "Healthcare", value: healthcare, color: "bg-red-500" },
    { label: "Debt", value: debt, color: "bg-amber-600" },
    { label: "Savings", value: savings, color: "bg-emerald-600" },
    { label: "Maintenance", value: maintenance, color: "bg-sky-500" },
  ];
  const used = Math.min(housing + commute + dependents + healthcare + debt + savings + maintenance, safeNet);
  const left = Math.max(0, safeNet - used);
  return (
    <div className="space-y-2">
      <div className="w-full h-6 rounded-lg overflow-hidden bg-zinc-200">
        <div
          className="h-6 bg-emerald-500 float-right"
          style={{ width: `${(left / safeNet) * 100}%` }}
          title={`Leftover ${currency}${left.toLocaleString()}`}
        />
        {slices.map((s) => (
          <div
            key={s.label}
            className={`h-6 ${s.color} float-left`}
            style={{ width: `${(Math.max(0, s.value) / safeNet) * 100}%` }}
            title={`${s.label} ${currency}${Math.max(0, s.value).toLocaleString()}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded ${s.color}`} />
            {s.label} {currency}
            {Math.max(0, s.value).toLocaleString()}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-emerald-500" />
          Leftover {currency}
          {Math.max(0, left).toLocaleString()}
        </div>
      </div>
      <div className="clear-both" />
    </div>
  );
}

// ---------- City Comparison Card ----------
function CityComparisonCard({
  currency,
  netMonthly,
  leftover,
  effectivePerHour,
  housing,
  dependentsMonthly,
  commuteMonthly,
  hoursPerMonth,
  maintenanceSum,
  healthcareMonthly,
  debtMonthly,
  studentLoan,
  savingsMonthly,
  hasKids,
  transportMode,
  commuteMinsPerDay,
}: {
  currency: string;
  netMonthly: number;
  leftover: number;
  effectivePerHour: number;
  housing: number;
  dependentsMonthly: number;
  commuteMonthly: number;
  hoursPerMonth: number;
  maintenanceSum: number;
  healthcareMonthly: number;
  debtMonthly: number;
  studentLoan: number;
  savingsMonthly: number;
  hasKids: boolean;
  transportMode: "pt" | "drive" | "remote" | "walk";
  commuteMinsPerDay: number;
}) {
  const [cityId, setCityId] = React.useState<RelocationCityId>("lisbon");

  if (netMonthly <= 0) return null;

  const city = RELOCATION_CITIES.find((c) => c.id === cityId) ?? RELOCATION_CITIES[0];

  // Assume income stays the same; environment changes.
  const newHousing = city.rent;
  const newDependents = hasKids ? city.childcare : 0;
  const newCommute = transportMode === "remote" || transportMode === "walk" ? 0 : city.commute;

  const relocLeftover = Math.round(
    netMonthly -
      newHousing -
      newCommute -
      maintenanceSum -
      newDependents -
      healthcareMonthly -
      (debtMonthly + studentLoan) -
      savingsMonthly
  );

  const relocFreedomRaw = relocLeftover / Math.max(1, hoursPerMonth);
  const relocFreedom = Number.isFinite(relocFreedomRaw) ? Math.round(relocFreedomRaw * 100) / 100 : 0;

  const deltaLeftover = relocLeftover - leftover;
  const deltaFreedom = relocFreedom - effectivePerHour;
  const deltaRent = housing - newHousing;
  const deltaCommuteMoney = commuteMonthly - newCommute;
  const deltaChildcare = dependentsMonthly - newDependents;

  const currentCommuteMins = transportMode === "remote" ? 0 : commuteMinsPerDay;
  const commuteMinutesDiff = Math.max(0, currentCommuteMins - city.avgCommuteMinutes);
  const commuteHoursSavedPerMonth = Math.round((commuteMinutesDiff * 22) / 60); // ~22 workdays

  const fmtSign = (v: number, decimals = 0) => `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}`;

  const stars = (score: number) => "★".repeat(score) + "☆".repeat(10 - score);

  return (
    <Card className="bg-gradient-to-br from-sky-50 via-emerald-50 to-amber-50 border-sky-200 shadow-md">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700 font-semibold flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <span>What if you lived somewhere cheaper?</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-md">
              We keep your income the same and swap in typical rent, childcare, and commute costs for another city.
              See how much your <span className="font-semibold">hour of freedom</span> could change.
            </p>
          </div>
          <div className="w-full sm:w-60">
            <label className="text-xs text-zinc-700">Compare with</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value as RelocationCityId)}
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-sm"
            >
              {RELOCATION_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 space-y-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase">You now</div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Housing</span>
              <Money value={housing} currency={currency} />
            </div>
            {hasKids && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Childcare</span>
                <Money value={dependentsMonthly} currency={currency} />
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-600">Commute</span>
              <Money value={commuteMonthly} currency={currency} />
            </div>
            <div className="border-t my-2" />
            <div className="flex justify-between font-medium">
              <span>Leftover</span>
              <Money value={leftover} currency={currency} clampZero={false} />
            </div>
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Real hourly freedom pay</span>
              <span>
                {currency}
                {effectivePerHour.toFixed(2)}/hr
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-2">
            <div className="text-xs font-semibold text-emerald-700 uppercase">
              If you lived in {city.shortLabel}
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-700">Typical housing</span>
              <Money value={newHousing} currency={currency} />
            </div>
            {hasKids && (
              <div className="flex justify-between">
                <span className="text-zinc-700">Typical childcare</span>
                <Money value={newDependents} currency={currency} />
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-700">Typical commute</span>
              <Money value={newCommute} currency={currency} />
            </div>
            <div className="border-t my-2" />
            <div className="flex justify-between font-semibold text-emerald-800">
              <span>Estimated leftover</span>
              <Money value={relocLeftover} currency={currency} clampZero={false} />
            </div>
            <div className="flex justify-between text-xs text-emerald-800">
              <span>Estimated freedom pay</span>
              <span>
                {currency}
                {relocFreedom.toFixed(2)}/hr
              </span>
            </div>
          </div>
        </div>

        {/* Differences / deltas */}
        <div className="rounded-xl border border-emerald-200 bg-white/80 p-3 text-xs sm:text-sm space-y-2">
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex flex-col">
              <span className="text-zinc-600">Monthly leftover</span>
              <span className={deltaLeftover >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                {deltaLeftover >= 0 ? "You’d keep " : "You’d lose "}
                {currency}
                {Math.abs(deltaLeftover).toLocaleString()} {deltaLeftover >= 0 ? "more" : "less"} / month
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-600">Freedom pay per hour</span>
              <span className={deltaFreedom >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                {fmtSign(deltaFreedom, 2)} {currency}/hr
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-600">Housing difference</span>
              <span className={deltaRent >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                {fmtSign(deltaRent)} {currency} / mo
              </span>
            </div>
            {hasKids && (
              <div className="flex flex-col">
                <span className="text-zinc-600">Childcare difference</span>
                <span className={deltaChildcare >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                  {fmtSign(deltaChildcare)} {currency} / mo
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-zinc-600">Commute cost difference</span>
              <span className={deltaCommuteMoney >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                {fmtSign(deltaCommuteMoney)} {currency} / mo
              </span>
            </div>
          </div>

          {commuteHoursSavedPerMonth > 0 && (
            <div className="pt-2 text-xs text-zinc-600">
              Roughly{" "}
              <span className="font-semibold text-emerald-700">
                {commuteHoursSavedPerMonth} fewer hours
              </span>{" "}
              spent commuting each month, based on your commute vs typical for {city.shortLabel}.
            </div>
          )}
        </div>

        {/* Soft ratings + affiliate-friendly CTA */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs sm:text-sm">
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/80 border border-zinc-200 flex items-center gap-2">
              <span className="text-zinc-500">Lifestyle</span>
              <span className="text-amber-600 font-semibold text-[11px] sm:text-xs">
                {stars(city.lifestyleScore)}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/80 border border-zinc-200 flex items-center gap-2">
              <span className="text-zinc-500">Remote-work friendly</span>
              <span className="text-emerald-600 font-semibold text-[11px] sm:text-xs">
                {stars(city.remoteScore)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <div className="text-[11px] text-zinc-500">
              Curious about actually making {city.shortLabel} work?
            </div>

            <div className="w-full max-w-xs space-y-2">
              {/* Primary CTA */}
              <a
                href="https://www.flatio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full rounded-full 
             bg-[#1D2B53] px-4 py-2.5 text-xs font-semibold text-white 
             shadow-sm hover:bg-[#16213E] hover:shadow-md transition"
              >
                <span className="text-white">See long-stay rentals in {city.shortLabel}</span>
                <span className="text-[10px] text-white opacity-80 transform transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>

              {/* Secondary CTA */}
              <a
                href="https://wise.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full rounded-full 
             border border-[#1D2B53] bg-white/90 px-4 py-2.5 text-xs 
             font-semibold text-[#1D2B53] hover:bg-blue-50 transition"
              >
                <span className="text-[#1D2B53]">Open a multi-currency account</span>
                <span className="text-[10px] text-[#1D2B53] opacity-70 transform transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ---------- Page ----------
export default function Page() {
  const [step, setStep] = useState<number>(0);
  const progressPct = step === 0 ? 33 : step === 1 ? 66 : 100;

  // Session/source & A/B
  const [landSource, setLandSource] = useState<string>("unknown");
  const [abVariant, setAbVariant] = useState<"A" | "B">("A");

  // Session id (cookie + LS)
  const [sessionId, setSessionId] = useState<string>("");
  const isSavingRef = React.useRef(false);
  const [hasBaselinePosted, setHasBaselinePosted] = useState(false);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  // UTM / A/B cookie
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const utm = url.searchParams.get("utm_source") || url.searchParams.get("ref");
      if (utm) setLandSource(utm);
      const params = new URLSearchParams(url.search);
      const qCity = params.get("city");
      if (qCity) setCityName(qCity);
      const qRegion = params.get("region") as RegionId | null;
      if (qRegion && regions.find((r) => r.id === qRegion)) setRegion(qRegion);
      const qUrban = params.get("urban") as Urbanicity | null;
      if (qUrban && URBANICITY[qUrban]) setUrbanicity(qUrban);
      const qCtx = params.get("ctx") as CommuteContext | null;
      if (qCtx && COMMUTE_CTX[qCtx]) setCommuteCtx(qCtx);
    } catch {}
    try {
      const existing = document.cookie.match(/rcs_ab=([AB])/);
      if (existing) setAbVariant(existing[1] as "A" | "B");
      else {
        const v = Math.random() < 0.5 ? "A" : "B";
        document.cookie = `rcs_ab=${v}; path=/; max-age=${60 * 60 * 24 * 365}`;
        setAbVariant(v);
      }
    } catch {}
  }, []);

  // Geo
  const [cityName, setCityName] = useState<string>("");
  const [region, setRegion] = useState<RegionId>("UK");
  const [urbanicity, setUrbanicity] = useState<Urbanicity>("city");
  const [commuteCtx, setCommuteCtx] = useState<CommuteContext>("mixed");
  const regionData = useMemo(() => regions.find((r) => r.id === region) || regions[0], [region]);
  const currency = currencySymbol(region);

  // Core inputs
  const [isGross, setIsGross] = useState<boolean>(false);

  // “Feels uncontrolled” text inputs
  const [takeHomeStr, setTakeHomeStr] = useState<string>("2200");
  const [housingStr, setHousingStr] = useState<string>("1200");
  const [otherIncomeStr, setOtherIncomeStr] = useState<string>("0"); // NEW

  const takeHome = useMemo(() => toNumberSafe(takeHomeStr), [takeHomeStr]);
  const housing = useMemo(() => toNumberSafe(housingStr), [housingStr]);
  const otherIncome = useMemo(() => toNumberSafe(otherIncomeStr), [otherIncomeStr]); // NEW

  const [housingTouched, setHousingTouched] = useState<boolean>(false);
  const [household, setHousehold] = useState<Household>("solo");
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [childrenAge, setChildrenAge] = useState<ChildAge>("school");
  const [billsIncluded, setBillsIncluded] = useState<boolean>(false);

  const [hoursWeek, setHoursWeek] = useState<number>(45);
  const [transportMode, setTransportMode] = useState<"pt" | "drive" | "remote" | "walk">("pt");
  const [wfhUtilities, setWfhUtilities] = useState<number>(0);

  // NEW: Commute minutes per working day (there & back)
  const [commuteMinsPerDay, setCommuteMinsPerDay] = useState<number>(60);

  // NEW: Commute override
  const [commuteOverrideStr, setCommuteOverrideStr] = useState<string>("");
  const commuteOverride = useMemo(() => toNumberSafe(commuteOverrideStr), [commuteOverrideStr]);
   // Remember the initial commute minutes so we can detect when the user changes it
  const initialCommuteMinsRef = React.useRef(commuteMinsPerDay);

   // If the user customises commute time or cost, use *their* month in the chart
useEffect(() => {
  const hasCustomCommuteTime = commuteMinsPerDay !== initialCommuteMinsRef.current;
  const hasCustomCommuteCost = commuteOverride > 0;

  if (hasCustomCommuteTime || hasCustomCommuteCost) {
    setChartUseBaseline(false);
  }
}, [commuteMinsPerDay, commuteOverride]);


  const [debtMonthly, setDebtMonthly] = useState<number>(150);
  const [studentLoan, setStudentLoan] = useState<number>(0);

  // Drivers & spends
  const [drivers, setDrivers] = useState<Record<DriverKey, number>>({ ...DRIVER_TYPICAL });
  const [spends, setSpends] = useState<Record<SpendKey, number>>({ pet: 0, therapy: 0, supportOthers: 0, health: 0 });

  // Healthcare (US)
  const [usHealthPlan, setUsHealthPlan] = useState<HealthPlanUS | null>(null);
  const [usHealthcareOverride, setUsHealthcareOverride] = useState<number>(0);

  // Savings
  const [savingsRate, setSavingsRate] = useState<number>(8);

  // Email/share
  const [email, setEmail] = useState<string>("");
  const [emailSaved, setEmailSaved] = useState<boolean>(false);
  const shareRef = React.useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // --- Challenge mode (what-if sliders) ---
  const [simRemoteDays, setSimRemoteDays] = useState<number>(0);
  const [simRentDelta, setSimRentDelta] = useState<number>(0);
  const [simIncomeDelta, setSimIncomeDelta] = useState<number>(0);

  // --- Chart toggles ---
const [chartUseBaseline, setChartUseBaseline] = useState<boolean>(false); // default: your month
const [includeOtherInChart, setIncludeOtherInChart] = useState<boolean>(true);


  // Derived
  const urb = URBANICITY[urbanicity];
  const ctx = COMMUTE_CTX[commuteCtx];
  const rentMul = urb.rentMul;
  const commuteMul = urb.commuteMul * ctx.commuteMul;

  const officeDaysPerWeek = 5;

  const commuteHoursPerWeek = useMemo(
  () =>
    transportMode === "remote" || transportMode === "walk"
      ? 0
      : (commuteMinsPerDay * officeDaysPerWeek) / 60,
  [transportMode, commuteMinsPerDay, officeDaysPerWeek]
);

// hoursWeek is now *work only*
const workHoursPerWeek = useMemo(() => hoursWeek, [hoursWeek]);

// total job time = work + commute
const totalJobHoursPerWeek = useMemo(
  () => workHoursPerWeek + commuteHoursPerWeek,
  [workHoursPerWeek, commuteHoursPerWeek]
);

// this drives your "hour of freedom" denominator
const hoursPerMonth = useMemo(
  () => Math.round(totalJobHoursPerWeek * 4.3),
  [totalJobHoursPerWeek]
);


  const baseNetFromPrimary = useMemo(
    () => (isGross ? approximateFromGross(region, takeHome) : takeHome),
    [isGross, takeHome, region]
  );

  const netMonthly = useMemo(() => {
    const base = baseNetFromPrimary;
    return Math.max(0, base + otherIncome); // UPDATED
  }, [baseNetFromPrimary, otherIncome]);

  // Net total for chart (optionally excludes Other income)
  const netForChart = useMemo(
    () => Math.max(0, includeOtherInChart ? netMonthly : baseNetFromPrimary),
    [includeOtherInChart, netMonthly, baseNetFromPrimary]
  );

  // Savings slice should reflect the same net as the chart
  const savingsForChart = useMemo(
    () => computeSavingsFromRate(includeOtherInChart ? netMonthly : baseNetFromPrimary, savingsRate),
    [includeOtherInChart, netMonthly, baseNetFromPrimary, savingsRate]
  );

  useEffect(() => {
    if (!housingTouched) {
      const v = Math.round(suggestedHousing(region, household) * rentMul);
      setHousingStr(String(v));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, household, urbanicity]);

  const commuteMonthly = useMemo(() => {
    if (transportMode === "remote" || transportMode === "walk") return 0;
    if (commuteOverride > 0) return commuteOverride;

    // 1) Base estimate for a “typical” 60 min/day commute in this region & mode
    const baseTypical = transportMode === "pt" ? regionData.commutePT : regionData.commuteDrive;
    const estimatedForContext = Math.round(baseTypical * commuteMul);

    // 2) Scale with actual minutes per day
    const typicalMinsPerDay = 60;
    const ratio =
      typicalMinsPerDay > 0 ? commuteMinsPerDay / typicalMinsPerDay : 1;

    return Math.round(estimatedForContext * ratio);
  }, [transportMode, regionData, commuteMul, commuteOverride, commuteMinsPerDay]);

  const driversSum = useMemo(
    () => (Object.keys(drivers) as DriverKey[]).reduce((s, k) => s + drivers[k], 0),
    [drivers]
  );
  const variableSum = useMemo(() => spends.pet + spends.therapy + spends.supportOthers + spends.health, [spends]);
  const billsUtilities = useMemo(
    () =>
      billsIncluded
        ? 0
        : Math.round((region === "US" ? 180 : region === "UK" ? 130 : 120) * (urbanicity === "inner" ? 1.15 : 1)),
    [billsIncluded, region, urbanicity]
  );
  const dependentsMonthly = useMemo(
    () => childCostPreset(region, childrenCount, childrenAge),
    [region, childrenCount, childrenAge]
  );
  const healthcareMonthly = useMemo(
    () => computeHealthcare(region, usHealthPlan, usHealthcareOverride),
    [region, usHealthPlan, usHealthcareOverride]
  );
  const savingsMonthly = useMemo(
    () => computeSavingsFromRate(netMonthly, savingsRate),
    [netMonthly, savingsRate]
  );

  const maintenanceSum = useMemo(
    () => driversSum + variableSum + billsUtilities + (transportMode === "remote" ? wfhUtilities : 0),
    [driversSum, variableSum, billsUtilities, transportMode, wfhUtilities]
  );

  const leftover = useMemo(
    () =>
      Math.round(
        netMonthly -
          housing -
          commuteMonthly -
          maintenanceSum -
          dependentsMonthly -
          healthcareMonthly -
          debtMonthly -
          studentLoan -
          savingsMonthly
      ),
    [netMonthly, housing, commuteMonthly, maintenanceSum, dependentsMonthly, healthcareMonthly, debtMonthly, studentLoan, savingsMonthly]
  );
  const effectivePerHour = useMemo(() => {
    const per = leftover / Math.max(1, hoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [leftover, hoursPerMonth]);
  const maintenancePct = useMemo(
    () => Math.max(0, Math.round((maintenanceSum / Math.max(1, netMonthly)) * 100)),
    [maintenanceSum, netMonthly]
  );

  // Baseline (PT + Typical drivers)
  const baselineCommute = useMemo(
    () => Math.round(regionData.commutePT * commuteMul),
    [regionData, commuteMul]
  );
  const typicalDriversSum = useMemo(
    () => (Object.keys(DRIVER_TYPICAL) as DriverKey[]).reduce((s, k) => s + DRIVER_TYPICAL[k], 0),
    []
  );
  const baselineMaintenance = useMemo(
    () => typicalDriversSum + variableSum + billsUtilities,
    [typicalDriversSum, variableSum, billsUtilities]
  );
  const baselineLeftover = useMemo(
    () =>
      Math.round(
        netMonthly -
          housing -
          baselineCommute -
          baselineMaintenance -
          dependentsMonthly -
          healthcareMonthly -
          debtMonthly -
          studentLoan -
          savingsMonthly
      ),
    [netMonthly, housing, baselineCommute, baselineMaintenance, dependentsMonthly, healthcareMonthly, debtMonthly, studentLoan, savingsMonthly]
  );
  const baselineFreedom = useMemo(() => {
    const per = baselineLeftover / Math.max(1, hoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [baselineLeftover, hoursPerMonth]);

  // --- Auto switch chart to "Your month" when commute is already zero ---
useEffect(() => {
  if (transportMode === "remote" || transportMode === "walk") {
    setChartUseBaseline(false);
  }
}, [transportMode]);


  // --- Challenge-mode derived values ---
  // Base commute cost for "0 remote days" in money terms
  const effectiveBaseCommute = useMemo(() => commuteMonthly, [commuteMonthly]);

  const simCommute = useMemo(
    () => Math.max(0, Math.round(effectiveBaseCommute * (1 - simRemoteDays / officeDaysPerWeek))),
    [effectiveBaseCommute, simRemoteDays, officeDaysPerWeek]
  );
  const simHousing = useMemo(() => Math.max(0, housing + simRentDelta), [housing, simRentDelta]);
  const simNet = useMemo(() => Math.max(0, netMonthly + simIncomeDelta), [netMonthly, simIncomeDelta]);

  // NEW: simulate hours when remote days reduce commute time
  const simHoursWeek = useMemo(() => {
    if (effectiveBaseCommute === 0 || simRemoteDays <= 0) return hoursWeek;
    const savedPerWeek = (simRemoteDays / officeDaysPerWeek) * commuteHoursPerWeek;
    return Math.max(1, hoursWeek - savedPerWeek);
  }, [effectiveBaseCommute, simRemoteDays, hoursWeek, officeDaysPerWeek, commuteHoursPerWeek]);

  const simHoursPerMonth = useMemo(
    () => Math.round(simHoursWeek * 4.3),
    [simHoursWeek]
  );

  const simLeftover = useMemo(
    () =>
      Math.round(
        simNet -
          simHousing -
          simCommute -
          maintenanceSum -
          dependentsMonthly -
          healthcareMonthly -
          debtMonthly -
          studentLoan -
          savingsMonthly
      ),
    [simNet, simHousing, simCommute, maintenanceSum, dependentsMonthly, healthcareMonthly, debtMonthly, studentLoan, savingsMonthly]
  );
  const simFreedom = useMemo(() => {
    const per = simLeftover / Math.max(1, simHoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [simLeftover, simHoursPerMonth]);
  const simDelta = useMemo(() => simLeftover - baselineLeftover, [simLeftover, baselineLeftover]);
  const simDeltaPerHour = useMemo(() => simFreedom - baselineFreedom, [simFreedom, baselineFreedom]);

  // Life Efficiency Score
  function norm(x: number, min: number, max: number) {
    if (!isFinite(x)) return 0;
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (x - min) / (max - min)));
  }
  const efficiencyScore = useMemo(() => {
    const s1 = 40 * norm(effectivePerHour, 0, 15);
    const leftoverRatio = netMonthly > 0 ? Math.max(0, Math.min(1, leftover / netMonthly)) : 0;
    const s2 = 25 * norm(leftoverRatio, 0, 0.5);
    const s3 = 20 * norm(1 - maintenancePct / 100, 0.3, 0.9);
    const s4 = 15 * norm((70 - Math.min(70, Math.max(30, hoursWeek))) / 40, 0, 1);
    return Math.round(s1 + s2 + s3 + s4);
  }, [effectivePerHour, leftover, netMonthly, maintenancePct, hoursWeek]);

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  // *** FIXED: strip styles in cloned DOM so html2canvas never sees lab()/modern color functions ***
  const makeShareCard = useCallback(async () => {
    if (!shareRef.current) return;

    try {
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: "#020617",
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Remove all external and embedded stylesheets in the cloned document
          clonedDoc
            .querySelectorAll('style,link[rel="stylesheet"]')
            .forEach((el) => el.parentNode && el.parentNode.removeChild(el));
        },
      });

      setImageUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Failed to create share image", err);
    }
  }, []);

  // --------- Submit logic ----------
  function buildPayload() {
    const sid = sessionId || getOrCreateSessionId();
    return {
      session_id: sid,
      email,
      region,
      household,
      take_home: netMonthly,
      housing,
      commute_mode:
        transportMode === "remote"
          ? "remote"
          : transportMode === "pt"
          ? "pt"
          : transportMode === "walk"
          ? "walk"
          : "drive",
      commute_monthly: commuteMonthly,
      hours_week: hoursWeek,
      drivers,
      toggles: {
        bills_included: billsIncluded,
        urbanicity,
        commute_context: commuteCtx,
        savings_rate: savingsRate,
        us_health_plan: usHealthPlan,
        land_source: landSource,
        ab_variant: abVariant,
      },
      dependents_monthly: dependentsMonthly,
      healthcare_monthly: healthcareMonthly,
      debt_monthly: debtMonthly + studentLoan,
      savings_monthly: savingsMonthly,
      leftover,
      effective_per_hour: effectivePerHour,
      maintenance_pct: maintenancePct,
    };
  }

  async function postOnce() {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const resp = await fetch(INGEST_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!resp.ok) {
        console.error("Ingest failed", await resp.text());
      } else {
        setHasBaselinePosted(true);
      }
    } catch {
      // swallow
    } finally {
      isSavingRef.current = false;
    }
  }

  function saveBaseline() {
    if (!hasBaselinePosted) postOnce();
  }
  function saveEmail() {
    if (!email) return;
    setEmailSaved(true);
    postOnce(); // upsert by session_id updates same row
  }

  // Auto-post once when user reaches step >= 1 (optional; safe with mutex)
  useEffect(() => {
    if (sessionId && !hasBaselinePosted && step >= 1 && !isSavingRef.current) {
      postOnce();
    }
  }, [step, sessionId, hasBaselinePosted]);

  const takeHomeWeird = (!isGross && takeHome > 20000) || (isGross && takeHome > 30000);
  const housingWeird = housingTouched && housing < 300 && !(["family", "share"] as Household[]).includes(household);
  const hoursWeird = hoursWeek < 30 || hoursWeek > 80;
  const hoursSplitWeird = commuteHoursPerWeek > hoursWeek;

  const badgeLeft = cityName ? cityName : `${regions.find((r) => r.id === region)?.label} · ${URBANICITY[urbanicity].label}`;

  // ---------- Sections (rendered once) ----------
  const StartSection = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden">
          <div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} />
        </div>

        <h1 className="mt-4 text-xl font-semibold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
          The Real Cost of Working
        </h1>

        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-zinc-900 to-zinc-600" />

        <div className="mt-6 text-zinc-700 space-y-3 leading-relaxed">
          <p>
            Your payslip shows what lands in your account — not what it costs to stay employable. This simulator folds in
            rent, commute, debt, kids, and the subtle “maintenance” spends that come with holding your life together.
          </p>
          <p>
            In under a minute, you’ll see how small changes in housing, commute, or hours worked can translate into more
            free time and financial breathing room.
          </p>
        </div>

        <div className="space-y-6 mt-6">
          <p className="text-zinc-700">
            See your <span className="font-semibold">hour of freedom</span> after rent, commute, and the real cost of
            staying employable.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">City name (optional)</label>
              <StickyTextInput
                id="city-input"
                data-probe="city"
                defaultValue={cityName}
                onValue={setCityName}
                className="w-full mt-2 rounded-lg border p-2 bg-white"
                placeholder="e.g., London, Berlin, NYC"
              />
              <div className="text-[11px] text-zinc-500 mt-1">Used for your badge only.</div>
            </div>
            <div>
              <label className="text-sm">Country/Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionId)}
                className="w-full mt-2 rounded-lg border p-2 bg-white"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div>
                <label className="text-sm">Area type</label>
                <select
                  value={urbanicity}
                  onChange={(e) => setUrbanicity(e.target.value as Urbanicity)}
                  className="w-full mt-2 rounded-lg border p-2 bg-white"
                >
                  <option value="inner" title="Dense downtown core — highest rents, short commute">
                    City centre / downtown
                  </option>
                  <option value="city" title="Wider metro area — moderate rent, balanced commute">
                    Urban / metro area
                  </option>
                  <option value="suburban" title="Residential areas outside the main city — lower rent, longer commute">
                    Suburban
                  </option>
                  <option value="rural" title="Small town or countryside — lowest rent, longest commute">
                    Rural / small town
                  </option>
                </select>
                <div className="text-[11px] text-zinc-500 mt-1">Affects rent and commute estimates — choose where you mainly live.</div>
              </div>
            </div>
            <div>
              <label className="text-sm">Commute context</label>
              <select
                value={commuteCtx}
                onChange={(e) => setCommuteCtx(e.target.value as CommuteContext)}
                className="w-full mt-2 rounded-lg border p-2 bg-white"
              >
                {Object.entries(COMMUTE_CTX).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-zinc-500 mt-1">Affects commute costs in baseline.</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setStep(1);
                saveBaseline();
              }}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-rose-600 to-pink-600"
            >
              Start my month
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const CoreInputs = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden">
          <div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Basics of your month</h2>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-amber-400 to-amber-600" />

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="text-sm">Income per month is</label>
            <div className="flex gap-2 mt-2 text-sm">
              <button
                onClick={() => setIsGross(false)}
                className={`px-3 py-1.5 rounded-full border ${
                  !isGross ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Net (after tax)
              </button>
              <button
                onClick={() => setIsGross(true)}
                className={`px-3 py-1.5 rounded-full border ${
                  isGross ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Gross (before tax)
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-zinc-500">{currency}</span>
              <StickyNumericInput
                id="income-input"
                data-probe="income"
                defaultValue={takeHomeStr}
                onValue={(t) => setTakeHomeStr(t)}
                className="w-full rounded-lg border p-2 bg-white"
                aria-label="Monthly income"
              />
            </div>
            {takeHomeWeird && (
              <div className="text-[11px] text-amber-600 mt-1">
                Looks unusually high for monthly. If yearly, divide by 12.
              </div>
            )}
            <p className="text-xs text-zinc-500 mt-1">
              If Gross selected, we estimate Net with a quick regional factor.
            </p>
          </div>

          {/* NEW: Other income */}
          <div>
            <label className="text-sm">Other income (optional)</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500">{currency}</span>
              <StickyNumericInput
                id="other-income-input"
                data-probe="other-income"
                defaultValue={otherIncomeStr}
                onValue={setOtherIncomeStr}
                className="w-full rounded-lg border p-2 bg-white"
                aria-label="Other monthly income"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              e.g. benefits, rental income, family support, interest, dividends
            </p>
          </div>

          <div>
            <label className="text-sm">Your rent or mortgage each month (your share)</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500">{currency}</span>
              <StickyNumericInput
                defaultValue={housingStr}
                id="housing-input"
                data-probe="housing"
                onValue={(t) => {
                  setHousingTouched(true);
                  setHousingStr(t);
                }}
                className="w-full rounded-lg border p-2 bg-white"
                aria-label="Monthly housing"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Typical for {regions.find((r) => r.id === region)?.label} × {URBANICITY[urbanicity].label}:{" "}
              {currency}
              {Math.round(suggestedHousing(region, household) * rentMul).toLocaleString()} ·{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  const v = Math.round(suggestedHousing(region, household) * rentMul);
                  setHousingStr(String(v));
                  setHousingTouched(true);
                }}
              >
                Use this
              </button>
            </p>
            {housingWeird && (
              <div className="text-[11px] text-amber-600 mt-1">
                That looks unusually low. Continue if intentional.
              </div>
            )}
            <label className="mt-2 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={billsIncluded}
                onChange={(e) => setBillsIncluded(e.target.checked)}
              />{" "}
              Bills included?
            </label>
          </div>

          <div>
            <label className="text-sm">Hours you actually work each week (not counting commute)</label>

  <InputRange
    min={10}
    max={80}
    step={1}
    value={hoursWeek}
    onValue={setHoursWeek}
    className="w-full mt-2"
  />
<div className="text-xs text-zinc-500 mt-1">
  {hoursWeek} hours / week at work
</div>

            {hoursWeird && (
              <div className="text-[11px] text-amber-600 mt-1">
                Outside usual range — continue if intentional.
              </div>
            )}
          </div>

          <div>
            <label className="text-sm">Getting to work</label>
            <div className="flex gap-2 flex-wrap mt-2">
              <button
                onClick={() => setTransportMode("pt")}
                className={`px-3 py-2 rounded-full border text-sm ${
                  transportMode === "pt" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Public transport
              </button>
              <button
                onClick={() => setTransportMode("drive")}
                className={`px-3 py-2 rounded-full border text-sm ${
                  transportMode === "drive" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Drive / taxi
              </button>
              <button
                onClick={() => setTransportMode("walk")}
                className={`px-3 py-2 rounded-full border text-sm ${
                  transportMode === "walk" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Walk / Bike
              </button>
              <button
                onClick={() => setTransportMode("remote")}
                className={`px-3 py-2 rounded-full border text-sm ${
                  transportMode === "remote" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                }`}
              >
                Remote / no commute
              </button>
            </div>

            {transportMode !== "remote" && (
  <div className="mt-3">
    {/* Title + big live minute value */}
    <div className="flex justify-between items-baseline text-sm">
      <span>Time spent commuting on a working day (there & back)</span>
      <span className="font-medium text-zinc-800">
        {commuteMinsPerDay} min
      </span>
    </div>

    {/* Live weekly hours */}
    <div className="text-xs text-zinc-600 mt-0.5">
      ≈ {commuteHoursPerWeek.toFixed(1)} h/week
    </div>
     <div className="text-[11px] text-zinc-500">
  This job takes about {totalJobHoursPerWeek.toFixed(1)} h/week in total,
  combining work and commute.
</div>

    <InputRange
      min={0}
      max={180}
      step={5}
      value={commuteMinsPerDay}
      onValue={setCommuteMinsPerDay}
      className="w-full mt-2"
    />

    <div className="text-[11px] text-zinc-500 mt-1">
      Used to calculate how much of your time and money goes into the commute.
    </div>

    {hoursSplitWeird && (
      <div className="text-[11px] text-amber-600 mt-1">
        Your commute time is higher than your total work+commute hours. One of these might be off.
      </div>
    )}
  </div>
)}


            {transportMode === "remote" && (
              <div className="mt-2">
                <label className="text-sm flex justify-between items-baseline">
                  <span>WFH utilities uplift</span>
                  <span className="text-xs text-zinc-600">
                    <Money value={wfhUtilities} currency={currency} /> / month
                  </span>
                </label>
                <InputRange
                  min={0}
                  max={80}
                  step={5}
                  value={wfhUtilities}
                  onValue={setWfhUtilities}
                  className="w-full"
                />
                <div className="text-[11px] text-zinc-500">
                  Covers extra heating/electric/internet when working from home.
                </div>
              </div>
            )}

            <div className="text-xs text-zinc-500 mt-2">
              Commute est.: <Money value={commuteMonthly} currency={currency} /> / month
              {commuteOverride > 0 && " (using your override)"}
            </div>

            {transportMode !== "remote" && transportMode !== "walk" && (
              <div className="mt-2">
                <label className="text-[11px] text-zinc-600">
                  If you know your real monthly commute cost, you can override it:
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">{currency}</span>
                  <StickyNumericInput
                    id="commute-override"
                    data-probe="commute-override"
                    defaultValue={commuteOverrideStr}
                    onValue={setCommuteOverrideStr}
                    className="w-32 rounded-lg border p-1.5 bg-white text-sm"
                    aria-label="Override commute cost"
                  />
                  {commuteOverride > 0 && (
                    <span className="text-[11px] text-emerald-700">
                      Using this instead of the estimate.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm">Home & kids</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {(["solo", "partner", "partnerKids", "singleParent", "share", "family"] as Household[]).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setHousehold(h);
                    if (h === "partner" || h === "solo" || h === "share" || h === "family") setChildrenCount(0);
                  }}
                  className={`px-3 py-2 rounded-full border text-sm ${
                    household === h ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                  }`}
                >
                  {h === "solo"
                    ? "Solo"
                    : h === "partner"
                    ? "Partner"
                    : h === "partnerKids"
                    ? "Partner + kids"
                    : h === "singleParent"
                    ? "Single parent"
                    : h === "share"
                    ? "House share"
                    : "Back home"}
                </button>
              ))}
            </div>
            {(household === "partnerKids" || household === "singleParent") && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Children</label>
                  <div className="flex gap-2 mt-2">
                    {[0, 1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setChildrenCount(n)}
                        className={`px-3 py-1.5 rounded-full border text-sm ${
                          childrenCount === n ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                        }`}
                      >
                        {n}
                        {n === 3 ? "+" : ""}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm">Age band</label>
                  <div className="flex gap-2 mt-2">
                    {(["nursery", "school"] as ChildAge[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setChildrenAge(a)}
                        className={`px-3 py-1.5 rounded-full border text-sm ${
                          childrenAge === a ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                        }`}
                      >
                        {a === "nursery" ? "Nursery/Pre-K" : "School age"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-zinc-600 col-span-2">
                  Estimated children-related monthly costs:{" "}
                  <Money value={childCostPreset(region, childrenCount, childrenAge)} currency={currency} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm">Debt repayments</label>
            <InputRange
              min={0}
              max={2000}
              step={10}
              value={debtMonthly}
              onValue={setDebtMonthly}
              className="w-full mt-3"
            />
            <div className="text-xs text-zinc-500 mt-1">
              <Money value={debtMonthly} currency={currency} /> / month
            </div>
          </div>

          <div>
            <label className="text-sm">Student loan</label>
            <InputRange
              min={0}
              max={300}
              step={5}
              value={studentLoan}
              onValue={setStudentLoan}
              className="w-full mt-3"
            />
            <div className="text-xs text-zinc-500 mt-1">
              <Money value={studentLoan} currency={currency} /> / month
            </div>
          </div>

          <div>
            <label className="text-sm">Savings / pension rate</label>
            <InputRange
              min={0}
              max={100}
              step={1}
              value={savingsRate}
              onValue={setSavingsRate}
              className="w-full mt-3"
            />
            <div className="text-xs text-zinc-500 mt-1">
              {savingsRate}% → <Money value={computeSavingsFromRate(netMonthly, savingsRate)} currency={currency} /> /
              month
            </div>
          </div>

          {region === "US" && (
            <div>
              <label className="text-sm">Healthcare (US)</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {(["employer", "market", "none"] as HealthPlanUS[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setUsHealthPlan(p)}
                    className={`px-3 py-2 rounded-full border text-sm ${
                      usHealthPlan === p ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"
                    }`}
                  >
                    {p === "employer" ? "Employer plan" : p === "market" ? "Marketplace" : "Uninsured"}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <label className="text-sm">Override / out-of-pocket</label>
                <InputRange
                  min={0}
                  max={2000}
                  step={10}
                  value={usHealthcareOverride}
                  onValue={setUsHealthcareOverride}
                  className="w-full"
                />
                <div className="text-[11px] text-zinc-500">If 0, we use a typical value for your plan.</div>
              </div>
            </div>
          )}

          {(Object.keys(DRIVER_META) as DriverKey[]).map((key) => {
            const meta = DRIVER_META[key];
            const lim = DRIVER_LIMITS[key];
            const border = `border-${meta.color}-300`;
            const bg = `bg-${meta.color}-50`;
            const titleClr = `text-${meta.color}-800`;
            return (
              <div key={key} className={`border rounded-2xl p-4 shadow-sm ${border} ${bg}`}>
                <div className={`text-sm font-medium flex items-center gap-2 ${titleClr}`}>
                  <span className="text-lg" aria-hidden>
                    {meta.emoji}
                  </span>
                  {meta.title}
                </div>
                <div className="text-xs text-zinc-600 mb-3">{meta.sub}</div>
                <InputRange
                  min={lim.min}
                  max={lim.max}
                  step={lim.step}
                  value={drivers[key]}
                  onValue={(n) => setDrivers((d) => ({ ...d, [key]: n }))}
                  className="w-full"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  Now: <Money value={drivers[key]} currency={currency} /> / mo • Typical: {currency}
                  {DRIVER_TYPICAL[key].toLocaleString()} • Range: {currency}
                  {lim.min}–{currency}
                  {lim.max}
                </div>
              </div>
            );
          })}

          {(Object.keys(SPEND_LIMITS) as SpendKey[]).map((k) => {
            const lim = SPEND_LIMITS[k];
            return (
              <div key={k} className="border rounded-2xl p-4">
                <div className="text-sm font-medium mb-2">{lim.label}</div>
                <InputRange
                  min={lim.min}
                  max={lim.max}
                  step={lim.step}
                  value={spends[k]}
                  onValue={(n) => setSpends((s) => ({ ...s, [k]: n }))}
                  className="w-full"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  Now: <Money value={spends[k]} currency={currency} /> / month (range {currency}
                  {lim.min}–{currency}
                  {lim.max})
                </div>
                {k === "pet" && (
                  <div className="text-[11px] text-zinc-500">
                    Exclude fashion/grooming; include vet, insurance, daycare/boarding, horses.
                  </div>
                )}
                {k === "health" && (
                  <div className="text-[11px] text-zinc-500">
                    Exclude insurance premiums; include meds, dental, vision, therapy not covered.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-2 mt-6">
          <button onClick={back} className="px-3 py-2 rounded-lg border">
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                saveBaseline();
                next();
              }}
              className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-amber-600 to-orange-600"
            >
              Continue
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const chartCommute = chartUseBaseline ? baselineCommute : commuteMonthly;
  const chartMaintenance = chartUseBaseline ? baselineMaintenance : maintenanceSum;

  // Headline values reflect whichever view the user selected
  const headlineLeftover = chartUseBaseline ? baselineLeftover : leftover;
  const headlineFreedom = chartUseBaseline ? baselineFreedom : effectivePerHour;
  const netForHeadline = netForChart;

    const RevealSection = (
    <Card className="max-w-5xl mx-auto bg-gradient-to-b from-white to-emerald-50/40">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden">
          <div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 border">
                {badgeLeft}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 border">
                {chartUseBaseline ? "Typical local month" : "Your month"}
              </span>
            </div>
            <h2 className="text-xl font-semibold mt-2">Your month, in plain numbers</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              placeholder={
                abVariant === "A"
                  ? "you@email.com — get the 1-page plan"
                  : "Email to unblur your fixes"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-72 px-4 py-2 rounded-lg border bg-white"
            />
            <button
              onClick={saveEmail}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                emailSaved
                  ? "border border-emerald-600 text-emerald-600 bg-white"
                  : "text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              }`}
            >
              {emailSaved
                ? abVariant === "A"
                  ? "Email saved"
                  : "Saved"
                : abVariant === "A"
                ? "Email me the 1-page plan"
                : "Unlock my plan"}
            </button>
          </div>
        </div>
        <div className="text-[11px] text-zinc-500 italic mt-1 sm:text-right">
          Anonymous analytics stored. Email optional and stored separately.
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-6">
          {/* LEFT COLUMN: share card, toggles, chart, city compare, image */}
          <div className="space-y-5">
            {/* SHARE CARD (what gets rendered to image) */}
            <div className="relative">
              <div
                ref={shareRef}
                style={{
                  backgroundColor: "#020617",
                  color: "#f9fafb",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.4)",
                  border: "1px solid rgba(251,113,133,0.55)",
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
                  maxWidth: "640px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>Real Cost Simulator</div>

                <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>
                  {currency}
                  {Math.max(0, headlineLeftover).toLocaleString()} kept over {hoursPerMonth}h
                </div>

                {headlineFreedom >= 0 ? (
                  <div style={{ fontSize: "16px", marginTop: "6px", color: "#e5e7eb" }}>
                    Every hour you spend working (including commuting), you keep about{" "}
                    <strong>
                      {currency}
                      {headlineFreedom.toFixed(2)}
                    </strong>{" "}
                    of disposable money.
                  </div>
                ) : (
                  <div style={{ fontSize: "16px", marginTop: "6px", color: "#fecaca" }}>
                    You’re effectively losing money for every hour worked — your costs of working
                    (housing, transport, dependents, etc.) are higher than your take-home pay.
                  </div>
                )}

                <div
                  style={{
                    fontSize: "11px",
                    marginTop: "6px",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  Calculated from your net discretionary pay ÷ actual hours (incl. commute).
                </div>

                {netForHeadline > 0 && (
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      marginTop: "10px",
                      color: "#fb7185",
                    }}
                  >
                    Out of every {currency}1 you earn,{" "}
                    {currency}
                    {(1 - Math.max(0, headlineLeftover) / netForHeadline).toFixed(2)} goes to
                    staying employable and functional.
                  </div>
                )}
              </div>
            </div>

            {/* Toggles & chart (NOT part of screenshot) */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-zinc-300">
              <label className="inline-flex items-center gap-2">
    <input
      type="checkbox"
      checked={chartUseBaseline}
      onChange={(e) => setChartUseBaseline(e.target.checked)}
    />
    Use typical transit costs in chart (auto unchecked if remote)
  </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeOtherInChart}
                  onChange={(e) => setIncludeOtherInChart(e.target.checked)}
                />
                Include “Other income” in chart totals
              </label>
            </div>

            <div className="mt-3">
              <div className="text-xs text-zinc-400 mb-2">
                If you do nothing, here’s where it goes
              </div>
              <BarChart
                currency={currency}
                net={netForChart}
                housing={housing}
                commute={chartCommute}
                maintenance={chartMaintenance}
                dependents={dependentsMonthly}
                healthcare={healthcareMonthly}
                debt={debtMonthly + studentLoan}
                savings={savingsForChart}
              />
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              Estimates • Updated{" "}
              {new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
            </div>

            {/* City comparison */}
            <CityComparisonCard
              currency={currency}
              netMonthly={netMonthly}
              leftover={leftover}
              effectivePerHour={effectivePerHour}
              housing={housing}
              dependentsMonthly={dependentsMonthly}
              commuteMonthly={commuteMonthly}
              hoursPerMonth={hoursPerMonth}
              maintenanceSum={maintenanceSum}
              healthcareMonthly={healthcareMonthly}
              debtMonthly={debtMonthly}
              studentLoan={studentLoan}
              savingsMonthly={savingsMonthly}
              hasKids={(household === "partnerKids" || household === "singleParent") && childrenCount > 0}
              transportMode={transportMode}
              commuteMinsPerDay={commuteMinsPerDay}
            />

            {/* Resulting image preview */}
            {imageUrl && (
              <div className="space-y-2">
                <div className="text-sm text-zinc-600">
                  Share image ready — right click to save, or long-press on mobile.
                </div>
                <img src={imageUrl} alt="share" className="w-full rounded-lg border" />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: all the existing cards */}
          <div className="space-y-5">
            <Card>
              <CardBody>
                <div className="text-sm font-medium">Life Efficiency Score</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-3xl font-semibold">{efficiencyScore}/100</div>
                </div>
                <div className="mt-2 h-2 w-full rounded bg-zinc-200 overflow-hidden">
                  <div
                    className="h-2 bg-emerald-500"
                    style={{ width: `${efficiencyScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">
                  Based on your hour-of-freedom, leftover ratio, maintenance %, and hours worked.
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 via-orange-100 to-rose-50 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="text-lg font-bold text-amber-800 tracking-tight mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="drop-shadow-sm">Try quick changes</span>
                </div>

                <div className="mt-2 space-y-4 text-sm">
                  <div>
                    <div className="flex justify-between text-zinc-700 font-medium">
                      <span>Remote days / week</span>
                      <span>{simRemoteDays}</span>
                    </div>
                    <InputRange
                      min={0}
                      max={5}
                      step={1}
                      value={simRemoteDays}
                      onValue={setSimRemoteDays}
                      className="w-full"
                      disabled={effectiveBaseCommute === 0}
                    />
                    {effectiveBaseCommute === 0 && (
                      <div className="mt-1 text-[11px] text-zinc-500">
                        You’re already remote / no commute selected — nothing to reduce here.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-700 font-medium">
                      <span>Rent change (monthly)</span>
                      <span>
                        {currency}
                        {simRentDelta}
                      </span>
                    </div>
                    <InputRange
                      min={-600}
                      max={600}
                      step={50}
                      value={simRentDelta}
                      onValue={setSimRentDelta}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-700 font-medium">
                      <span>Income change (monthly)</span>
                      <span>
                        {currency}
                        {simIncomeDelta}
                      </span>
                    </div>
                    <InputRange
                      min={-500}
                      max={1500}
                      step={50}
                      value={simIncomeDelta}
                      onValue={setSimIncomeDelta}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-300 bg-white/70 backdrop-blur p-3 text-sm space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 font-medium">Before (baseline)</span>
                    <span className="font-medium text-zinc-800">
                      {currency}
                      {Math.max(0, baselineLeftover).toLocaleString()} / mo · {currency}
                      {baselineFreedom.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 font-medium">After (with changes)</span>
                    <span className="font-semibold text-amber-800">
                      {currency}
                      {Math.max(0, simLeftover).toLocaleString()} / mo · {currency}
                      {simFreedom.toFixed(2)}/hr
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between ${
                      simDelta >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    <span className="font-medium">Difference</span>
                    <span className="font-semibold">
                      {simDelta >= 0 ? "+" : ""}
                      {currency}
                      {simDelta.toLocaleString()} / mo · {simDeltaPerHour >= 0 ? "+" : ""}
                      {currency}
                      {simDeltaPerHour.toFixed(2)}/hr
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 pt-1">
                    Plain English: You’d keep{" "}
                    <span className="font-medium text-amber-700">
                      {simDelta >= 0
                        ? `${currency}${simDelta.toLocaleString()} more`
                        : `${currency}${Math.abs(simDelta).toLocaleString()} less`}
                    </span>{" "}
                    each month with the sliders set above.
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    (Only the three sliders affect this. All your other inputs stay the same — including how you split work vs commute time.)
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm">Your chosen month (with your commute & drivers)</div>
                <div className="text-2xl font-semibold mt-1">
                  Kept: <Money value={leftover} currency={currency} clampZero={false} />
                </div>
                <div className="text-sm mt-1">
                  {effectivePerHour >= 0 ? (
                    <>
                      After every hour you spend working (including commuting), you truly keep about{" "}
                      <strong>
                        {currency}
                        {effectivePerHour.toFixed(2)}
                      </strong>{" "}
                      of disposable money.
                    </>
                  ) : (
                    <span className="text-rose-700">
                      You’re effectively losing money for every hour worked — your costs of working
                      (housing, transport, dependents, etc.) are higher than your take-home pay.
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-500 mt-2">
                  Commute:{" "}
                  {transportMode === "remote"
                    ? "remote"
                    : transportMode === "pt"
                    ? "public transport"
                    : transportMode === "walk"
                    ? "walk/bike"
                    : "driving/taxis"}{" "}
                  • Maintenance: {maintenancePct}% • Kids:{" "}
                  <Money value={dependentsMonthly} currency={currency} />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm">Commute estimate</div>
                <div className="text-2xl font-semibold mt-1">
                  <Money value={commuteMonthly} currency={currency} /> / month
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Context: {COMMUTE_CTX[commuteCtx].label} • Area: {URBANICITY[urbanicity].label}.
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {transportMode === "remote" || transportMode === "walk"
                    ? "Assuming no daily commute for this setup."
                    : `Assuming about ${officeDaysPerWeek} days/week × ${commuteMinsPerDay} minutes/day ≈ ${commuteHoursPerWeek.toFixed(
                        1
                      )} h/week spent commuting.`}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm">Maintenance totals</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Drivers: <Money value={driversSum} currency={currency} /> •
                  Variable spends: <Money value={variableSum} currency={currency} /> •
                  Bills/utilities: <Money value={billsUtilities} currency={currency} />
                  {transportMode === "remote" && (
                    <>
                      {" "}
                      • WFH utilities uplift: <Money value={wfhUtilities} currency={currency} />
                    </>
                  )}
                </div>
              </CardBody>
            </Card>

            {healthcareMonthly > 0 && (
              <Card>
                <CardBody>
                  <div className="text-sm">Healthcare gap</div>
                  <div className="text-2xl font-semibold mt-1">
                    <Money value={healthcareMonthly} currency={currency} /> / month
                  </div>
                </CardBody>
              </Card>
            )}

            {(savingsMonthly > 0 || savingsRate > 0) && (
              <Card>
                <CardBody>
                  <div className="text-sm">Savings / pension</div>
                  <div className="text-2xl font-semibold mt-1">
                    <Money value={savingsMonthly} currency={currency} /> / month ({savingsRate}%)
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="flex gap-2">
              <button
                onClick={makeShareCard}
                className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                Create share image
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // ---------- Render (no remounts) ----------
  return (
    <div className="min-h-screen text-zinc-900 py-10 bg-[radial-gradient(ellipse_at_top_left,rgba(125,211,252,0.22),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(244,114,182,0.18),transparent_45%)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className={step === 0 ? "" : "hidden"} aria-hidden={step !== 0}>
          {StartSection}
        </div>
        <div className={step === 1 ? "" : "hidden"} aria-hidden={step !== 1}>
          {CoreInputs}
        </div>
        <div className={step === 2 ? "" : "hidden"} aria-hidden={step !== 2}>
          {RevealSection}
        </div>
      </div>
    </div>
  );
}

/* ---------- Session helpers ---------- */
let __sidCounter = 0;
function simpleId() {
  return "sid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2) + "_" + (__sidCounter++).toString(36);
}
function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie =
    name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + String(maxAge);
}
function getOrCreateSessionId(): string {
  try {
    const fromCookie = getCookie("rcs_sid");
    const fromLS =
      typeof window !== "undefined"
        ? window.localStorage.getItem("rcs_session_id")
        : null;
    const existing = fromCookie || fromLS;
    if (existing) {
      if (!fromCookie) setCookie("rcs_sid", existing);
      if (!fromLS && typeof window !== "undefined")
        window.localStorage.setItem("rcs_session_id", existing);
      return existing;
    }
    const id = simpleId();
    setCookie("rcs_sid", id);
    if (typeof window !== "undefined")
      window.localStorage.setItem("rcs_session_id", id);
    return id;
  } catch {
    const id = "sid_" + Math.random().toString(36).slice(2);
    setCookie("rcs_sid", id);
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem("rcs_session_id", id);
    } catch {}
    return id;
  }
}

/* ---------- Sticky inputs (uncontrolled with ref sync) ---------- */
function StickyTextInput(props: {
  id?: string;
  "data-probe"?: string;
  defaultValue: string;
  onValue: (t: string) => void;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const { defaultValue, onValue, ...rest } = props;
  const ref = React.useRef<HTMLInputElement>(null);
  const lastExternal = React.useRef(defaultValue);

  useEffect(() => {
    if (ref.current && lastExternal.current !== defaultValue) {
      ref.current.value = defaultValue;
      lastExternal.current = defaultValue;
    }
  }, [defaultValue]);

  return (
    <input
      ref={ref}
      type="text"
      autoComplete="off"
      spellCheck={false}
      defaultValue={defaultValue}
      onInput={(e) => onValue((e.target as HTMLInputElement).value)}
      {...rest}
    />
  );
}

function StickyNumericInput(props: {
  id?: string;
  "data-probe"?: string;
  defaultValue: string;
  onValue: (t: string) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const { defaultValue, onValue, ...rest } = props;
  const ref = React.useRef<HTMLInputElement>(null);
  const lastExternal = React.useRef(defaultValue);

  useEffect(() => {
    if (ref.current && lastExternal.current !== defaultValue) {
      ref.current.value = defaultValue;
      lastExternal.current = defaultValue;
    }
  }, [defaultValue]);

  const normalize = (v: string) => {
    if (v.trim() === "" || v === "-") return "0";
    const n = Number(v.replace(/[, ]/g, ""));
    return Number.isFinite(n) ? String(n) : "0";
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      spellCheck={false}
      defaultValue={defaultValue}
      onInput={(e) => onValue((e.target as HTMLInputElement).value)}
      onBlur={() => {
        const el = ref.current;
        if (!el) return;
        const pos = el.selectionStart ?? el.value.length;
        const norm = normalize(el.value);
        el.value = norm;
        onValue(norm);
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
      }}
      {...rest}
    />
  );
}
