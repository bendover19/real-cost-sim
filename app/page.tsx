"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

/**
 * Real Cost Simulator — page.tsx (stable session + single-submit)
 * - Percentiles/benchmarks removed (no Supabase calls from client)
 * - Robust session_id via cookie + localStorage (never empty)
 * - NO auto-post on reveal (prevents duplicate rows)
 * - Post happens only on button click (baseline or email unlock)
 * - Mutex prevents overlapping posts in dev/StrictMode
 */

const INGEST_PATH = "/api/ingest";

// ---------- Types ----------
type RegionId = "UK" | "EU" | "US" | "OTHER";
type Household =
  | "solo"
  | "partner"
  | "partnerKids"
  | "singleParent"
  | "share"
  | "family";
type DriverKey =
  | "belonging"
  | "identity"
  | "timeTrade"
  | "comfort"
  | "connection"
  | "treats"
  | "moneyPressure";
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

const URBANICITY: Record<
  Urbanicity,
  { label: string; rentMul: number; commuteMul: number }
> = {
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
const DRIVER_META: Record<
  DriverKey,
  { emoji: string; title: string; sub: string; color: string }
> = {
  belonging: { emoji: "🫶", title: "Belonging", sub: "Not being the ghost at work or with friends", color: "rose" },
  identity: { emoji: "👔", title: "Identity", sub: "Looking like you belong where you work", color: "violet" },
  timeTrade: { emoji: "⏱️", title: "Time trade", sub: "When tired, you buy time (delivery, taxis)", color: "amber" },
  comfort: { emoji: "🌙", title: "Comfort", sub: "Switching off after rough days", color: "sky" },
  connection: { emoji: "💘", title: "Connection", sub: "Dating / keeping relationships alive", color: "fuchsia" },
  treats: { emoji: "🎁", title: "Small treats", sub: "Subscriptions and little upgrades", color: "emerald" },
  moneyPressure: { emoji: "💸", title: "Money pressure", sub: "BNPL/overdraft to smooth the month", color: "orange" },
};

// Wide slider limits per driver (covers outliers)
const DRIVER_LIMITS: Record<DriverKey, { min: number; max: number; step: number }> = {
  belonging: { min: 0, max: 800, step: 5 },
  identity: { min: 0, max: 800, step: 5 },
  timeTrade: { min: 0, max: 1200, step: 5 },
  comfort: { min: 0, max: 600, step: 5 },
  connection: { min: 0, max: 1200, step: 5 },
  treats: { min: 0, max: 400, step: 5 },
  moneyPressure: { min: 0, max: 300, step: 5 },
};

// Slider limits for variable spends (high-variance)
const SPEND_LIMITS: Record<
  SpendKey,
  { label: string; min: number; max: number; step: number }
> = {
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
  return Math.round((netMonthly * Math.max(0, Math.min(20, ratePct))) / 100);
}

// ---------- Session helpers (cookie + localStorage) ----------
function uuidv4() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const buf = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(buf);
  return [...buf].map((b, i) => (i === 6 ? (b & 0x0f) | 0x40 : i === 8 ? (b & 0x3f) | 0x80 : b))
    .map((b, i) => (i === 4 || i === 6 || i === 8 || i === 10 ? "-" : "") + b.toString(16).padStart(2, "0"))
    .join("");
}
function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}
function getOrCreateSessionId(): string {
  try {
    const fromCookie = getCookie("rcs_sid");
    const fromLS =
      typeof window !== "undefined" ? window.localStorage.getItem("rcs_session_id") : null;
    const existing = fromCookie || fromLS;
    if (existing) {
      if (!fromCookie) setCookie("rcs_sid", existing);
      if (!fromLS && typeof window !== "undefined")
        window.localStorage.setItem("rcs_session_id", existing);
      return existing;
    }
    const id = uuidv4();
    setCookie("rcs_sid", id);
    if (typeof window !== "undefined")
      window.localStorage.setItem("rcs_session_id", id);
    return id;
  } catch {
    // absolute last resort
    const id = Math.random().toString(36).slice(2);
    setCookie("rcs_sid", id);
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem("rcs_session_id", id);
    } catch {}
    return id;
  }
}

// ---------- Small primitives ----------
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur ${className || ""}`}>{children}</div>
);
const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-5 ${className || ""}`}>{children}</div>
);
const Money: React.FC<{ value: number; currency: string }> = ({ value, currency }) => (
  <span className="tabular-nums font-semibold">{currency}{Math.max(0, value).toLocaleString()}</span>
);

// ---------- Chart ----------
function BarChart({
  currency, net, housing, commute, maintenance, dependents, healthcare, debt, savings,
}: {
  currency: string; net: number; housing: number; commute: number; maintenance: number; dependents: number; healthcare: number; debt: number; savings: number;
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
      <div className="w-full h-6 rounded-lg overflow-hidden bg-zinc-800">
        <div className="h-6 bg-emerald-500 float-right" style={{ width: `${(left / safeNet) * 100}%` }} title={`Leftover ${currency}${left.toLocaleString()}`} />
        {slices.map(s => (
          <div key={s.label} className={`h-6 ${s.color} float-left`} style={{ width: `${(Math.max(0, s.value) / safeNet) * 100}%` }} title={`${s.label} ${currency}${Math.max(0, s.value).toLocaleString()}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-300">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded ${s.color}`} />{s.label} {currency}{Math.max(0, s.value).toLocaleString()}</div>
        ))}
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" />Leftover {currency}{Math.max(0, left).toLocaleString()}</div>
      </div>
      <div className="clear-both" />
    </div>
  );
}

// ---------- Page ----------
export default function Page() {
  const [step, setStep] = useState<number>(0);
  const progressPct = step === 0 ? 33 : step === 1 ? 66 : 100;

  // Session/source & A/B
  const [landSource, setLandSource] = useState<string>("unknown");
  const [abVariant, setAbVariant] = useState<"A" | "B">("A");

  // Create + cache a guaranteed session id (cookie + LS); never empty
  const [sessionId, setSessionId] = useState<string>("");
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const utm = url.searchParams.get("utm_source") || url.searchParams.get("ref");
      if (utm) setLandSource(utm);
      const params = new URLSearchParams(url.search);
      const qCity = params.get("city"); if (qCity) setCityName(qCity);
      const qRegion = params.get("region") as RegionId | null; if (qRegion && regions.find(r => r.id === qRegion)) setRegion(qRegion);
      const qUrban = params.get("urban") as Urbanicity | null; if (qUrban && URBANICITY[qUrban]) setUrbanicity(qUrban);
      const qCtx = params.get("ctx") as CommuteContext | null; if (qCtx && COMMUTE_CTX[qCtx]) setCommuteCtx(qCtx);
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
  const regionData = useMemo(() => regions.find(r => r.id === region) || regions[0], [region]);
  const currency = currencySymbol(region);

  // Core inputs
  const [isGross, setIsGross] = useState<boolean>(false);
  const [takeHome, setTakeHome] = useState<number>(2200);
  const [housing, setHousing] = useState<number>(1200);
  const [housingTouched, setHousingTouched] = useState<boolean>(false);
  const [household, setHousehold] = useState<Household>("solo");
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [childrenAge, setChildrenAge] = useState<ChildAge>("school");
  const [billsIncluded, setBillsIncluded] = useState<boolean>(false);

  const [hoursWeek, setHoursWeek] = useState<number>(45);
  const [transportMode, setTransportMode] = useState<"pt" | "drive" | "remote" | "walk">("pt");
  const [wfhUtilities, setWfhUtilities] = useState<number>(0);

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
  const shareRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Submit guard
  const isSavingRef = useRef(false);
  const [hasBaselinePosted, setHasBaselinePosted] = useState(false);

  // Derived
  const hoursPerMonth = useMemo(() => Math.round(hoursWeek * 4.3), [hoursWeek]);
  const urb = URBANICITY[urbanicity];
  const ctx = COMMUTE_CTX[commuteCtx];
  const rentMul = urb.rentMul;
  const commuteMul = urb.commuteMul * ctx.commuteMul;

  const netMonthly = useMemo(() => {
    const base = isGross ? approximateFromGross(region, takeHome) : takeHome;
    return Math.max(0, base);
  }, [isGross, takeHome, region]);

  useEffect(() => {
    if (!housingTouched) setHousing(Math.round(suggestedHousing(region, household) * rentMul));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, household, urbanicity]);

  const commuteMonthly = useMemo(() => {
    if (transportMode === "remote" || transportMode === "walk") return 0;
    const base = transportMode === "pt" ? regionData.commutePT : regionData.commuteDrive;
    return Math.round(base * commuteMul);
  }, [transportMode, regionData, commuteMul]);

  const driversSum = useMemo(() => (Object.keys(drivers) as DriverKey[]).reduce((s, k) => s + drivers[k], 0), [drivers]);
  const variableSum = useMemo(() => spends.pet + spends.therapy + spends.supportOthers + spends.health, [spends]);
  const billsUtilities = useMemo(
    () => (billsIncluded ? 0 : Math.round((region === "US" ? 180 : region === "UK" ? 130 : 120) * (urbanicity === "inner" ? 1.15 : 1))),
    [billsIncluded, region, urbanicity]
  );
  const dependentsMonthly = useMemo(() => childCostPreset(region, childrenCount, childrenAge), [region, childrenCount, childrenAge]);
  const healthcareMonthly = useMemo(() => computeHealthcare(region, usHealthPlan, usHealthcareOverride), [region, usHealthPlan, usHealthcareOverride]);
  const savingsMonthly = useMemo(() => computeSavingsFromRate(netMonthly, savingsRate), [netMonthly, savingsRate]);

  const maintenanceSum = useMemo(
    () => driversSum + variableSum + billsUtilities + (transportMode === "remote" ? wfhUtilities : 0),
    [driversSum, variableSum, billsUtilities, transportMode, wfhUtilities]
  );

  const leftover = useMemo(
    () => Math.round(netMonthly - housing - commuteMonthly - maintenanceSum - dependentsMonthly - healthcareMonthly - debtMonthly - studentLoan - savingsMonthly),
    [netMonthly, housing, commuteMonthly, maintenanceSum, dependentsMonthly, healthcareMonthly, debtMonthly, studentLoan, savingsMonthly]
  );
  const effectivePerHour = useMemo(() => {
    const per = leftover / Math.max(1, hoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [leftover, hoursPerMonth]);
  const maintenancePct = useMemo(() => Math.max(0, Math.round((maintenanceSum / Math.max(1, netMonthly)) * 100)), [maintenanceSum, netMonthly]);

  // Baseline (PT + Typical drivers)
  const baselineCommute = useMemo(() => Math.round(regionData.commutePT * commuteMul), [regionData, commuteMul]);
  const typicalDriversSum = useMemo(() => (Object.keys(DRIVER_TYPICAL) as DriverKey[]).reduce((s, k) => s + DRIVER_TYPICAL[k], 0), []);
  const baselineMaintenance = useMemo(() => typicalDriversSum + variableSum + billsUtilities, [typicalDriversSum, variableSum, billsUtilities]);
  const baselineLeftover = useMemo(
    () => Math.round(netMonthly - housing - baselineCommute - baselineMaintenance - dependentsMonthly - healthcareMonthly - debtMonthly - studentLoan - savingsMonthly),
    [netMonthly, housing, baselineCommute, baselineMaintenance, dependentsMonthly, healthcareMonthly, debtMonthly, studentLoan, savingsMonthly]
  );
  const baselineFreedom = useMemo(() => {
    const per = baselineLeftover / Math.max(1, hoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [baselineLeftover, hoursPerMonth]);

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

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  async function makeShareCard() {
    if (!shareRef.current) return;
    const canvas = await html2canvas(shareRef.current, { backgroundColor: "#0a0a0a", scale: 2 });
    setImageUrl(canvas.toDataURL("image/png"));
  }

  // --------- Submit logic (manual only) ----------
  function buildPayload() {
    return {
      session_id: sessionId || getOrCreateSessionId(), // belt & braces
      land_source: landSource,
      ab_variant: abVariant,
      step_posted: step,
      city_name: cityName || null,
      region,
      urbanicity,
      commute_context: commuteCtx,
      rent_mul: rentMul,
      commute_mul: commuteMul,
      is_gross: isGross,
      take_home_input: takeHome,
      net_monthly: netMonthly,
      household,
      children_count: childrenCount,
      children_age: childrenAge,
      housing,
      bills_included: billsIncluded,
      commute_mode: transportMode,
      commute_monthly: commuteMonthly,
      wfh_utilities: wfhUtilities,
      hours_week: hoursWeek,
      drivers,
      spends,
      dependents_monthly: dependentsMonthly,
      healthcare_monthly: healthcareMonthly,
      us_health_plan: usHealthPlan,
      us_health_override: usHealthcareOverride,
      debt_monthly: debtMonthly,
      student_loan: studentLoan,
      savings_rate: savingsRate,
      savings_monthly: savingsMonthly,
      bills_utilities: billsUtilities,
      leftover,
      effective_per_hour: effectivePerHour,
      maintenance_pct: maintenancePct,
      baseline_commute: baselineCommute,
      baseline_leftover: baselineLeftover,
      baseline_freedom: baselineFreedom,
      delta_remote_1d: Math.round(baselineCommute * (1 / 5)),
      delta_debt_refi: Math.round((debtMonthly + studentLoan) * 0.15),
      delta_total:
        Math.max(0, Math.round(baselineCommute * (1 / 5)) + Math.round((debtMonthly + studentLoan) * 0.15)),
      email: email || null,
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
    } catch (e) {
      console.error(e);
    } finally {
      isSavingRef.current = false;
    }
  }

  function saveBaseline() {
    // Post only once; later email submit will update same row (server must upsert)
    if (!hasBaselinePosted) postOnce();
  }

  function saveEmail() {
    if (!email) return;
    setEmailSaved(true);
    // Always post; server should upsert on session_id so this updates same row
    postOnce();
  }

  // --- Validation helpers ---
  const takeHomeWeird = (!isGross && takeHome > 20000) || (isGross && takeHome > 30000);
  const housingWeird = housingTouched && housing < 300 && !(["family", "share"] as Household[]).includes(household);
  const hoursWeird = hoursWeek < 30 || hoursWeek > 80;

  const badgeLeft = cityName
    ? cityName
    : `${regions.find((r) => r.id === region)?.label} · ${URBANICITY[urbanicity].label}`;

  // ---------- Screens ----------
  const Start = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden"><div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} /></div>
        <h1 className="mt-4 text-xl font-semibold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">The Real Cost of Working</h1>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-zinc-900 to-zinc-600" />
        <div className="space-y-6 mt-6">
          <p className="text-zinc-700 dark:text-zinc-300">Your payslip ≠ your pay.</p>
          <p className="text-zinc-700 dark:text-zinc-300">See your <span className="font-semibold">hour of freedom</span> after rent, commute, and the real cost of staying employable.</p>
          <p className="text-zinc-700 dark:text-zinc-300 font-medium">In <span className="font-bold text-lg text-zinc-900 dark:text-white">one minute</span> you’ll get the truth, then what to change.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">City name (optional)</label>
              <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="e.g., London, Berlin, NYC" className="w-full mt-2 rounded-lg border p-2 bg-white dark:bg-zinc-900" />
              <div className="text-[11px] text-zinc-500 mt-1">Used for your badge only.</div>
            </div>
            <div>
              <label className="text-sm">Country/Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value as RegionId)} className="w-full mt-2 rounded-lg border p-2 bg-white dark:bg-zinc-900">
                {regions.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm">Area type</label>
              <select value={urbanicity} onChange={(e) => setUrbanicity(e.target.value as Urbanicity)} className="w-full mt-2 rounded-lg border p-2 bg-white dark:bg-zinc-900">
                {Object.entries(URBANICITY).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm">Commute context</label>
              <select value={commuteCtx} onChange={(e) => setCommuteCtx(e.target.value as CommuteContext)} className="w-full mt-2 rounded-lg border p-2 bg-white dark:bg-zinc-900">
                {Object.entries(COMMUTE_CTX).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
              <div className="text-[11px] text-zinc-500 mt-1">Affects commute costs in baseline.</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-rose-600 to-pink-600">Start my month</button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const CoreInputs = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden"><div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} /></div>
        <h2 className="mt-4 text-xl font-semibold">Basics of your month</h2>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-amber-400 to-amber-600" />

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="text-sm">Income number is</label>
            <div className="flex gap-2 mt-2 text-sm">
              <button onClick={() => setIsGross(false)} className={`px-3 py-1.5 rounded-full border ${!isGross ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Net (after tax)</button>
              <button onClick={() => setIsGross(true)} className={`px-3 py-1.5 rounded-full border ${isGross ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Gross (before tax)</button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-zinc-500">{currency}</span>
              <input type="number" value={takeHome === 0 ? "" : takeHome} onChange={(e) => { const v = e.target.value; setTakeHome(v === "" ? 0 : Number(v)); }} className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-900" />
            </div>
            {takeHomeWeird && <div className="text-[11px] text-amber-600 mt-1">Looks unusually high for monthly. If yearly, divide by 12.</div>}
            <p className="text-xs text-zinc-500 mt-1">If Gross selected, we estimate Net with a quick regional factor.</p>
          </div>

          <div>
            <label className="text-sm">Your rent or mortgage each month (your share)</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500">{currency}</span>
              <input type="number" value={housing === 0 ? "" : housing} onChange={(e) => { const v = e.target.value; setHousingTouched(true); setHousing(v === "" ? 0 : Number(v)); }} className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-900" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Typical for {regions.find((r) => r.id === region)?.label} × {URBANICITY[urbanicity].label}: {currency}{Math.round(suggestedHousing(region, household) * rentMul).toLocaleString()} ·{" "}
              <button type="button" className="underline" onClick={() => { setHousing(Math.round(suggestedHousing(region, household) * rentMul)); setHousingTouched(true); }}>Use this</button>
            </p>
            {housingWeird && <div className="text-[11px] text-amber-600 mt-1">That looks unusually low. Continue if intentional.</div>}
            <label className="mt-2 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={billsIncluded} onChange={(e) => setBillsIncluded(e.target.checked)} /> Bills included?</label>
          </div>

          <div>
            <label className="text-sm">Hours you work each week, including commute</label>
            <input type="range" min={30} max={80} step={1} value={hoursWeek} onChange={(e) => setHoursWeek(Number(e.target.value))} className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1">{hoursWeek} hours / week → ~{hoursPerMonth} per month</div>
            {hoursWeird && <div className="text-[11px] text-amber-600 mt-1">Outside usual range — continue if intentional.</div>}
          </div>

          <div>
            <label className="text-sm">Getting to work</label>
            <div className="flex gap-2 flex-wrap mt-2">
              <button onClick={() => setTransportMode("pt")} className={`px-3 py-2 rounded-full border text-sm ${transportMode === "pt" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Public transport</button>
              <button onClick={() => setTransportMode("drive")} className={`px-3 py-2 rounded-full border text-sm ${transportMode === "drive" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Drive / taxi</button>
              <button onClick={() => setTransportMode("walk")} className={`px-3 py-2 rounded-full border text-sm ${transportMode === "walk" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Walk / Bike</button>
              <button onClick={() => setTransportMode("remote")} className={`px-3 py-2 rounded-full border text-sm ${transportMode === "remote" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>Remote / no commute</button>
            </div>
            {transportMode === "remote" && (
              <div className="mt-2">
                <label className="text-sm">WFH utilities uplift</label>
                <input type="range" min={0} max={80} step={5} value={wfhUtilities} onChange={(e) => setWfhUtilities(Number(e.target.value))} className="w-full" />
                <div className="text-[11px] text-zinc-500">Covers heating/electric/internet share.</div>
              </div>
            )}
            <div className="text-xs text-zinc-500 mt-1">Commute est.: <Money value={commuteMonthly} currency={currency} /> / month</div>
          </div>

          <div>
            <label className="text-sm">Home & kids</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {(["solo", "partner", "partnerKids", "singleParent", "share", "family"] as Household[]).map(h => (
                <button key={h} onClick={() => { setHousehold(h); if (h === "partner" || h === "solo" || h === "share" || h === "family") { setChildrenCount(0); } }} className={`px-3 py-2 rounded-full border text-sm ${household === h ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>
                  {h === "solo" ? "Solo" : h === "partner" ? "Partner" : h === "partnerKids" ? "Partner + kids" : h === "singleParent" ? "Single parent" : h === "share" ? "House share" : "Back home"}
                </button>
              ))}
            </div>
            {(household === "partnerKids" || household === "singleParent") && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Children</label>
                  <div className="flex gap-2 mt-2">
                    {[0, 1, 2, 3].map(n => (
                      <button key={n} onClick={() => setChildrenCount(n)} className={`px-3 py-1.5 rounded-full border text-sm ${childrenCount === n ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>{n}{n === 3 ? "+" : ""}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm">Age band</label>
                  <div className="flex gap-2 mt-2">
                    {(["nursery", "school"] as ChildAge[]).map(a => (
                      <button key={a} onClick={() => setChildrenAge(a)} className={`px-3 py-1.5 rounded-full border text-sm ${childrenAge === a ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>{a === "nursery" ? "Nursery/Pre-K" : "School age"}</button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-zinc-600 col-span-2">Estimated children-related monthly costs: <Money value={childCostPreset(region, childrenCount, childrenAge)} currency={currency} /></div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm">Debt repayments</label>
            <input type="range" min={0} max={2000} step={10} value={debtMonthly} onChange={(e) => setDebtMonthly(Number(e.target.value))} className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1"><Money value={debtMonthly} currency={currency} /> / month</div>
          </div>

          <div>
            <label className="text-sm">Student loan</label>
            <input type="range" min={0} max={300} step={5} value={studentLoan} onChange={(e) => setStudentLoan(Number(e.target.value))} className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1"><Money value={studentLoan} currency={currency} /> / month</div>
          </div>

          <div>
            <label className="text-sm">Savings / pension rate</label>
            <input type="range" min={0} max={20} step={1} value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))} className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1">{savingsRate}% → <Money value={computeSavingsFromRate(netMonthly, savingsRate)} currency={currency} /> / month</div>
          </div>

          {region === "US" && (
            <div>
              <label className="text-sm">Healthcare (US)</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {(["employer", "market", "none"] as HealthPlanUS[]).map(p => (
                  <button key={p} onClick={() => setUsHealthPlan(p)} className={`px-3 py-2 rounded-full border text-sm ${usHealthPlan === p ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300"}`}>
                    {p === "employer" ? "Employer plan" : p === "market" ? "Marketplace" : "Uninsured"}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <label className="text-sm">Override / out-of-pocket</label>
                <input type="range" min={0} max={2000} step={10} value={usHealthcareOverride} onChange={(e) => setUsHealthcareOverride(Number(e.target.value))} className="w-full" />
                <div className="text-[11px] text-zinc-500">If 0, we use a typical value for your plan.</div>
              </div>
            </div>
          )}

          {/* Driver sliders */}
          {(Object.keys(DRIVER_META) as DriverKey[]).map((key) => {
            const meta = DRIVER_META[key];
            const lim = DRIVER_LIMITS[key];
            const border = `border-${meta.color}-300`;
            const bg = `bg-${meta.color}-50 dark:bg-${meta.color}-950/30`;
            const titleClr = `text-${meta.color}-800 dark:text-${meta.color}-300`;
            return (
              <div key={key} className={`border rounded-2xl p-4 shadow-sm ${border} ${bg}`}>
                <div className={`text-sm font-medium flex items-center gap-2 ${titleClr}`}><span className="text-lg" aria-hidden>{meta.emoji}</span>{meta.title}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{meta.sub}</div>
                <input type="range" min={lim.min} max={lim.max} step={lim.step} value={drivers[key]} onChange={(e) => setDrivers((d) => ({ ...d, [key]: Number(e.target.value) }))} className="w-full" />
                <div className="text-xs text-zinc-500 mt-1">Now: <Money value={drivers[key]} currency={currency} /> / mo • Typical: {currency}{DRIVER_TYPICAL[key].toLocaleString()} • Range: {currency}{lim.min}–{currency}{lim.max}</div>
              </div>
            );
          })}

          {/* Variable support spends */}
          {(Object.keys(SPEND_LIMITS) as SpendKey[]).map((k) => {
            const lim = SPEND_LIMITS[k];
            return (
              <div key={k} className="border rounded-2xl p-4">
                <div className="text-sm font-medium mb-2">{lim.label}</div>
                <input type="range" min={lim.min} max={lim.max} step={lim.step} value={spends[k]} onChange={(e) => setSpends((s) => ({ ...s, [k]: Number(e.target.value) }))} className="w-full" />
                <div className="text-xs text-zinc-500 mt-1">Now: <Money value={spends[k]} currency={currency} /> / month (range {currency}{lim.min}–{currency}{lim.max})</div>
                {k === "pet" && <div className="text-[11px] text-zinc-500">Exclude fashion/grooming; include vet, insurance, daycare/boarding, horses.</div>}
                {k === "health" && <div className="text-[11px] text-zinc-500">Exclude insurance premiums; include meds, dental, vision, therapy not covered.</div>}
              </div>
            );
          })}
        </div>

        {/* Bottom nav */}
        <div className="flex flex-wrap justify-between items-center gap-2 mt-6">
          <button onClick={back} className="px-3 py-2 rounded-lg border">Back</button>
          <div className="flex gap-2">
            <button onClick={saveBaseline} className="px-3 py-2 rounded-lg border">Save my baseline</button>
            <button onClick={next} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-amber-600 to-orange-600">Continue</button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // --- Challenge Mode state ---
  const [simRemoteDays, setSimRemoteDays] = useState<number>(0);
  const [simRentDelta, setSimRentDelta] = useState<number>(0);
  const [simIncomeDelta, setSimIncomeDelta] = useState<number>(0);
  const simNet = Math.max(0, netMonthly + simIncomeDelta);
  const simCommute = Math.max(0, baselineCommute * Math.max(0, (5 - simRemoteDays) / 5));
  const simHousing = Math.max(0, housing + simRentDelta);
  const simLeftover = Math.round(
    simNet - simHousing - simCommute - maintenanceSum - dependentsMonthly - healthcareMonthly - debtMonthly - studentLoan - savingsMonthly
  );
  const simFreedom = Math.round((simLeftover / Math.max(1, hoursPerMonth)) * 100) / 100;

  const Reveal = (
    <Card className="max-w-5xl mx-auto bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="h-1 w-full bg-zinc-200 rounded overflow-hidden"><div className="h-full bg-zinc-900" style={{ width: `${progressPct}%` }} /></div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border">{badgeLeft}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border">PT baseline</span>
            </div>
            <h2 className="text-xl font-semibold mt-2">Your month, in plain numbers</h2>
            <p className="text-sm text-zinc-500 max-w-md">Standardised baseline shows Public Transport + Typical behaviours for your area. Your choices change the deltas.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              placeholder={abVariant === "A" ? "you@email.com — get the 1-page plan" : "Email to unblur your fixes"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-72 px-4 py-2 rounded-lg border bg-white dark:bg-zinc-900"
            />
            <button
              onClick={saveEmail}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                emailSaved ? "border border-emerald-600 text-emerald-600 bg-white dark:bg-zinc-900" : "text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              }`}
            >
              {emailSaved ? (abVariant === "A" ? "Email saved" : "Saved") : (abVariant === "A" ? "Email me the 1-page plan" : "Unlock my plan")}
            </button>
          </div>
        </div>
        <div className="text-[11px] text-zinc-500 italic mt-1 sm:text-right">Anonymous analytics stored. Email optional and stored separately.</div>

        <div className="mt-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* LOCKABLE REPORT CARD */}
            <div className="relative">
              <div ref={shareRef} className={`bg-zinc-900 text-white rounded-2xl p-5 ring-1 ring-rose-300/30 shadow-lg ${!emailSaved ? "blur-sm select-none pointer-events-none" : ""}`}>
                <div className="text-sm text-zinc-300">Real Cost Simulator</div>
                <div className="text-3xl font-bold mt-1">{currency}{Math.max(0, baselineLeftover).toLocaleString()} kept over {hoursPerMonth}h</div>
                <div className="text-lg mt-1">That's {currency}{baselineFreedom.toFixed(2)} per hour of freedom<span className="align-super text-xs text-zinc-400">*</span>.</div>
                <div className="text-[11px] text-zinc-500 mt-1 italic">*Calculated as net discretionary pay per actual hour of life traded.</div>
                {netMonthly > 0 && (
                  <div className="text-3xl font-bold mt-1">Out of every {currency}1 you earn, {currency}{(1 - Math.max(0, baselineLeftover) / netMonthly).toFixed(2)} goes to staying employable and functional.</div>
                )}

                {/* No percentiles/benchmarks */}

                <div className="mt-4">
                  <div className="text-xs text-zinc-400 mb-2">If you do nothing, here’s where it goes</div>
                  <BarChart
                    currency={currency}
                    net={netMonthly}
                    housing={housing}
                    commute={baselineCommute}
                    maintenance={baselineMaintenance}
                    dependents={dependentsMonthly}
                    healthcare={healthcareMonthly}
                    debt={debtMonthly + studentLoan}
                    savings={savingsMonthly}
                  />
                </div>
                <div className="mt-4 text-xs text-zinc-400">Estimates • Updated {new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
              </div>

              {/* Overlay lock prompt */}
              {!emailSaved && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="backdrop-blur-sm bg-zinc-900/70 border border-zinc-700 rounded-xl p-5 text-center max-w-sm mx-4">
                    <div className="text-3xl">🔒</div>
                    <div className="mt-1 font-semibold">Unlock your personalised report</div>
                    <div className="text-sm text-zinc-300 mt-1">Enter your email to reveal the full breakdown and fixes.</div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <input placeholder={abVariant === "A" ? "you@email.com" : "Email to unblur"} value={email} onChange={(e) => setEmail(e.target.value)} className="w-72 max-w-full px-3 py-2 rounded-lg border bg-white text-zinc-900" />
                      <button onClick={saveEmail} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600">Unlock</button>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2">One email. No spam — just your PDF and a few tips.</div>
                  </div>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <div className="text-sm text-zinc-600">Share image ready — right click to save, or long-press on mobile.</div>
                <img src={imageUrl} alt="share" className="w-full rounded-lg border" />
              </div>
            )}
          </div>

          <div className="space-y-5">
            <Card><CardBody>
              <div className="text-sm font-medium">Life Efficiency Score</div>
              <div className="flex items-end justify-between mt-1"><div className="text-3xl font-semibold">{efficiencyScore}/100</div></div>
              <div className="mt-2 h-2 w-full rounded bg-zinc-200 overflow-hidden"><div className="h-2 bg-emerald-500" style={{ width: `${efficiencyScore}%` }} /></div>
              <div className="text-[11px] text-zinc-500 mt-2">Based on your hour-of-freedom, leftover ratio, maintenance %, and hours worked.</div>
            </CardBody></Card>

            <Card><CardBody>
              <div className="text-sm font-medium">Challenge mode</div>
              <div className="mt-2 space-y-3 text-sm">
                <div><div className="flex justify-between"><span>Remote days / week</span><span>{simRemoteDays}</span></div>
                  <input type="range" min={0} max={5} step={1} value={simRemoteDays} onChange={(e) => setSimRemoteDays(Number(e.target.value))} className="w-full" />
                </div>
                <div><div className="flex justify-between"><span>Rent change (monthly)</span><span>{currency}{simRentDelta}</span></div>
                  <input type="range" min={-600} max={600} step={50} value={simRentDelta} onChange={(e) => setSimRentDelta(Number(e.target.value))} className="w-full" />
                </div>
                <div><div className="flex justify-between"><span>Income change (monthly)</span><span>{currency}{simIncomeDelta}</span></div>
                  <input type="range" min={-500} max={1500} step={50} value={simIncomeDelta} onChange={(e) => setSimIncomeDelta(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500">Simulated: <span className="font-semibold">{currency}{Math.max(0, simLeftover).toLocaleString()}</span> ({currency}{simFreedom.toFixed(2)}/hr)</div>
              <div className="text-xs text-zinc-500">Δ vs your baseline: {currency}{(simLeftover - baselineLeftover).toLocaleString()}</div>
              {!emailSaved && <div className="text-[11px] text-zinc-500 mt-2">Email your optimised plan & settings.</div>}
            </CardBody></Card>

            <Card><CardBody>
              <div className="text-sm">Your chosen month (with your commute & drivers)</div>
              <div className="text-2xl font-semibold mt-1">Kept: <Money value={leftover} currency={currency} /> ({currency}{effectivePerHour.toFixed(2)}/hr)</div>
              <div className="text-xs text-zinc-500 mt-2">Commute: {transportMode === "remote" ? "remote" : transportMode === "pt" ? "public transport" : transportMode === "walk" ? "walk/bike" : "driving/taxis"} • Maintenance: {maintenancePct}% • Kids: <Money value={dependentsMonthly} currency={currency} /></div>
            </CardBody></Card>

            <Card><CardBody>
              <div className="text-sm">Commute estimate</div>
              <div className="text-2xl font-semibold mt-1"><Money value={commuteMonthly} currency={currency} /> / month</div>
              <div className="text-xs text-zinc-500 mt-2">Context: {COMMUTE_CTX[commuteCtx].label} • Area: {URBANICITY[urbanicity].label}.</div>
            </CardBody></Card>

            <Card><CardBody>
              <div className="text-sm">Maintenance totals</div>
              <div className="text-xs text-zinc-500 mt-1">Drivers: <Money value={driversSum} currency={currency} /> • Variable spends: <Money value={variableSum} currency={currency} /> • Bills/utilities: <Money value={billsUtilities} currency={currency} /></div>
            </CardBody></Card>

            {healthcareMonthly > 0 && (<Card><CardBody><div className="text-sm">Healthcare gap</div><div className="text-2xl font-semibold mt-1"><Money value={healthcareMonthly} currency={currency} /> / month</div></CardBody></Card>)}

            {(savingsMonthly > 0 || savingsRate > 0) && (<Card><CardBody><div className="text-sm">Savings / pension</div><div className="text-2xl font-semibold mt-1"><Money value={savingsMonthly} currency={currency} /> / month ({savingsRate}%)</div></CardBody></Card>)}

            <div className="flex gap-2">
              <button onClick={makeShareCard} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-violet-600">Create share image</button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-50 py-10
      bg-[radial-gradient(ellipse_at_top_left,rgba(125,211,252,0.22),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(244,114,182,0.18),transparent_45%)]
      dark:bg-[radial-gradient(ellipse_at_top_left,rgba(125,211,252,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(244,114,182,0.10),transparent_45%)]">
      <div className="max-w-5xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {step === 0 && Start}
            {step === 1 && CoreInputs}
            {step === 2 && <div className="space-y-4">{CoreInputs}</div>}
            {step >= 3 && Reveal}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Self-tests ----------
(function runSelfTests() {
  console.assert(currencySymbol("UK") === "£", "UK currency £");
  console.assert(currencySymbol("US") === "$", "US currency $");
  console.assert(suggestedHousing("UK", "share") === 800, "UK share rent 800");
  console.assert(suggestedHousing("EU", "solo") > 0, "EU solo rent > 0");
  const typicalSum = Object.values(DRIVER_TYPICAL).reduce((a, b) => a + b, 0);
  console.assert(typicalSum === 140 + 110 + 120 + 90 + 120 + 45 + 25, "Driver typical sum matches");
  console.assert(approximateFromGross("UK", 4000) > 2000, "Gross→Net produces net");
  console.assert(computeHealthcare("US", "employer", 0) === 200, "US employer");
  console.assert(computeHealthcare("US", null, 0) === 250, "US default");
  console.assert(computeHealthcare("UK", null, 0) === 0, "Non-US 0");
  console.assert(computeSavingsFromRate(2000, 8) === 160, "8% of 2000 is 160");
  console.assert(childCostPreset("UK", 2, "nursery") > childCostPreset("UK", 1, "school"), "Nursery & more kids cost more");
})();
