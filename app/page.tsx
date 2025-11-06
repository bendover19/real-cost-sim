
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

/**
 * Real Cost Simulator — App Router, single-file page.tsx
 * - No shadcn/ui imports; only Tailwind classes
 * - Data capture via POST /api/ingest (Vercel API route you added)
 * - “Hour of freedom” + asterisk + “Out of every £1…” survival ratio
 * - US-only healthcare, kids, debt slider, savings toggle
 * - Share image generator
 * - Lightweight self-tests (run once outside JSX)
 */

// ---------- Data capture config ----------
const DATA_MODE: 'api' | 'supabase' = 'api'; // leave as 'api'
const INGEST_PATH = '/api/ingest';           // your Vercel API route

// ---------- Types ----------
type RegionId = 'UK' | 'EU' | 'US' | 'OTHER';
type Household = 'solo' | 'partner' | 'partnerKids' | 'singleParent' | 'share' | 'family';
type Level = 'low' | 'typical' | 'high';
type DriverKey = 'belonging' | 'identity' | 'timeTrade' | 'comfort' | 'connection' | 'treats' | 'moneyPressure';
type ToggleKey = 'pet' | 'therapy' | 'supportOthers' | 'health';

interface Region {
  id: RegionId; label: string; currency: string; commutePT: number; commuteDrive: number;
}

// ---------- Tables ----------
const regions: Region[] = [
  { id: 'UK',    label: 'United Kingdom',   currency: '£', commutePT: 180, commuteDrive: 260 },
  { id: 'EU',    label: 'European Union',   currency: '€', commutePT: 120, commuteDrive: 190 },
  { id: 'US',    label: 'United States',    currency: '$', commutePT: 110, commuteDrive: 220 },
  { id: 'OTHER', label: 'Other / OECD',     currency: '$', commutePT: 100, commuteDrive: 180 },
];

const DRIVER_TABLE: Record<DriverKey, { low: number; typical: number; high: number }> = {
  belonging:     { low: 40, typical: 140, high: 260 },
  identity:      { low: 35, typical: 110, high: 220 },
  timeTrade:     { low: 30, typical: 120, high: 280 },
  comfort:       { low: 20, typical: 90,  high: 190 },
  connection:    { low: 0,  typical: 120, high: 260 },
  treats:        { low: 15, typical: 45,  high: 110 },
  moneyPressure: { low: 0,  typical: 25,  high: 75  },
};

const DRIVER_META: Record<DriverKey, { emoji: string; title: string; sub: string; color: string }> = {
  belonging:  { emoji: '🫶', title: 'Belonging',  sub: 'Not being the ghost at work or with friends', color: 'rose' },
  identity:   { emoji: '👔', title: 'Identity',   sub: 'Looking like you belong where you work',      color: 'violet' },
  timeTrade:  { emoji: '⏱️', title: 'Time trade', sub: 'When tired, you buy time (delivery, taxis)', color: 'amber' },
  comfort:    { emoji: '🌙', title: 'Comfort',    sub: 'Switching off after rough days',             color: 'sky' },
  connection: { emoji: '💘', title: 'Connection', sub: 'Dating / keeping relationships alive',       color: 'fuchsia' },
  treats:     { emoji: '🎁', title: 'Small treats', sub: 'Subscriptions and little upgrades',        color: 'emerald' },
  moneyPressure:{ emoji:'💸', title:'Money pressure', sub:'BNPL/overdraft to smooth the month',       color: 'orange' },
};

const TOGGLE_TABLE: Record<ToggleKey, number> = { pet: 70, therapy: 160, supportOthers: 120, health: 60 };

const RENT_TABLE: Record<RegionId, Record<Household, number>> = {
  UK:    { solo: 1200, partner: 1600, partnerKids: 1900, singleParent: 1500, share: 800, family: 0 },
  EU:    { solo: 900,  partner: 1200, partnerKids: 1500, singleParent: 1100, share: 600, family: 0 },
  US:    { solo: 1300, partner: 1700, partnerKids: 2100, singleParent: 1600, share: 850, family: 0 },
  OTHER: { solo: 800,  partner: 1100, partnerKids: 1300, singleParent: 900,  share: 500, family: 0 },
};

// ---------- Utils ----------
function currencySymbol(regionId: RegionId) {
  const r = regions.find(rr => rr.id === regionId);
  return r ? r.currency : '£';
}
function suggestedHousing(regionId: RegionId, household: Household) {
  const byRegion = RENT_TABLE[regionId] || RENT_TABLE.OTHER;
  const v = byRegion[household];
  return typeof v === 'number' ? v : RENT_TABLE.OTHER.solo;
}
function childCost(regionId: RegionId, household: Household) {
  const kids = household === 'partnerKids' || household === 'singleParent';
  if (!kids) return 0;
  if (regionId === 'UK') return 600;
  if (regionId === 'EU') return 450;
  if (regionId === 'US') return 700;
  return 400;
}
function approximateTaxNet(monthlyTakeHome: number) {
  return { netMonthly: monthlyTakeHome, grossMonthly: monthlyTakeHome * 1.25, taxMonthly: monthlyTakeHome * 0.25 };
}
function computeHealthcare(regionId: RegionId) { return regionId === 'US' ? 250 : 0; }
function computeSavings(netMonthly: number, on: boolean) { return on ? Math.round(netMonthly * 0.08) : 0; }

// ---------- Small primitives ----------
const Card: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur ${className || ''}`}>{children}</div>
);
const CardBody: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <div className={`p-5 ${className||''}`}>{children}</div>
);
const Pill: React.FC<{active?: boolean; onClick?: ()=>void; children: React.ReactNode}> = ({active, onClick, children}) => (
  <button onClick={onClick} className={`px-3 py-2 rounded-full border text-sm transition
    ${active ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{children}</button>
);
const Money: React.FC<{value: number; currency: string}> = ({value, currency}) => (
  <span className="tabular-nums font-semibold">{currency}{Math.max(0,value).toLocaleString()}</span>
);

// ---------- Chart ----------
function BarChart({ currency, net, housing, commute, maintenance, dependents, healthcare, debt, savings }:{
  currency:string; net:number; housing:number; commute:number; maintenance:number; dependents:number; healthcare:number; debt:number; savings:number;
}) {
  const safeNet = Math.max(1, net);
  const slices = [
    { label:'Housing', value:housing, color:'bg-rose-500' },
    { label:'Commute', value:commute, color:'bg-orange-500' },
    { label:'Dependents', value:dependents, color:'bg-indigo-500' },
    { label:'Healthcare', value:healthcare, color:'bg-red-500' },
    { label:'Debt', value:debt, color:'bg-amber-600' },
    { label:'Savings', value:savings, color:'bg-emerald-600' },
    { label:'Maintenance', value:maintenance, color:'bg-sky-500' },
  ];
  const used = Math.min(housing+commute+dependents+healthcare+debt+savings+maintenance, safeNet);
  const left = Math.max(0, safeNet - used);

  return (
    <div className="space-y-2">
      <div className="w-full h-6 rounded-lg overflow-hidden bg-zinc-800">
        <div className="h-6 bg-emerald-500 float-right" style={{ width: `${(left/safeNet)*100}%`}} title={`Leftover ${currency}${left.toLocaleString()}`} />
        {slices.map(s => (
          <div key={s.label} className={`h-6 ${s.color} float-left`} style={{ width: `${(Math.max(0,s.value)/safeNet)*100}%`}} title={`${s.label} ${currency}${Math.max(0,s.value).toLocaleString()}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-300">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded ${s.color}`} />{s.label} {currency}{Math.max(0,s.value).toLocaleString()}
          </div>
        ))}
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" />Leftover {currency}{Math.max(0,left).toLocaleString()}</div>
      </div>
      <div className="clear-both" />
    </div>
  );
}

// ---------- Page ----------
export default function Page() {
  const [step, setStep] = useState<number>(0);

  // Core inputs
  const [region, setRegion] = useState<RegionId>('UK');
  const [takeHome, setTakeHome] = useState<number>(2200);
  const [housing, setHousing] = useState<number>(1200);
  const [housingTouched, setHousingTouched] = useState<boolean>(false);
  const [household, setHousehold] = useState<Household>('solo');
  const [hoursWeek, setHoursWeek] = useState<number>(45);
  const [transportMode, setTransportMode] = useState<'pt'|'drive'|'remote'>('pt');
  const [debtMonthly, setDebtMonthly] = useState<number>(150);
  const [savingsOn, setSavingsOn] = useState<boolean>(false);

  // Human drivers
  const [drivers, setDrivers] = useState<Record<DriverKey, Level>>({
    belonging:'typical', identity:'typical', timeTrade:'typical', comfort:'typical',
    connection:'typical', treats:'typical', moneyPressure:'low'
  });
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({ pet:false, therapy:false, supportOthers:false, health:false });

  // Email/share
  const [email, setEmail] = useState<string>('');
  const [emailSaved, setEmailSaved] = useState<boolean>(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string|null>(null);

  // Post guard
  const [postedOnce, setPostedOnce] = useState<boolean>(false);

  // Derived
  const regionData = useMemo(() => regions.find(r => r.id === region) || regions[0], [region]);
  const currency = currencySymbol(region);
  const hoursPerMonth = useMemo(() => Math.round(hoursWeek * 4.3), [hoursWeek]);

  const commuteMonthly = useMemo(() => {
    if (transportMode === 'remote') return 0;
    return transportMode === 'pt' ? regionData.commutePT : regionData.commuteDrive;
  }, [transportMode, regionData]);

  const maintenanceSum = useMemo(() => {
    let base = 0; (Object.keys(DRIVER_TABLE) as DriverKey[]).forEach(k => base += DRIVER_TABLE[k][drivers[k]]);
    let adds = 0; (Object.keys(toggles) as ToggleKey[]).forEach(k => adds += toggles[k] ? TOGGLE_TABLE[k] : 0);
    return base + adds;
  }, [drivers, toggles]);

  const { netMonthly } = useMemo(() => approximateTaxNet(takeHome), [takeHome]);

  useEffect(() => { if (!housingTouched) setHousing(suggestedHousing(region, household)); },
    [region, household, housingTouched]);

  const dependentsMonthly = useMemo(() => childCost(region, household), [region, household]);
  const healthcareMonthly  = useMemo(() => computeHealthcare(region), [region]);
  const savingsMonthly     = useMemo(() => computeSavings(netMonthly, savingsOn), [netMonthly, savingsOn]);

  const leftover = useMemo(() => Math.round(
    netMonthly - housing - commuteMonthly - maintenanceSum - dependentsMonthly - healthcareMonthly - debtMonthly - savingsMonthly
  ), [netMonthly, housing, commuteMonthly, maintenanceSum, dependentsMonthly, healthcareMonthly, debtMonthly, savingsMonthly]);

  const effectivePerHour = useMemo(() => {
    const per = leftover / Math.max(1, hoursPerMonth);
    return Number.isFinite(per) ? Math.round(per * 100) / 100 : 0;
  }, [leftover, hoursPerMonth]);

  const maintenancePct = useMemo(() => Math.max(0, Math.round((maintenanceSum/Math.max(1, netMonthly))*100)), [maintenanceSum, netMonthly]);

  const next = () => setStep(s => Math.min(3, s+1));
  const back = () => setStep(s => Math.max(0, s-1));
  const setDriver = (name: DriverKey, level: Level) => setDrivers(d => ({...d, [name]: level}));

  async function makeShareCard() {
    if (!shareRef.current) return;
    const canvas = await html2canvas(shareRef.current, { backgroundColor: '#0a0a0a', scale: 2 });
    setImageUrl(canvas.toDataURL('image/png'));
  }

  async function saveResult(opts: { force?: boolean } = {}) {
  const { force = false } = opts;
  try {
    if (postedOnce && !force) return;
    const payload = {
      region, household, take_home: netMonthly, housing,
      commute_mode: transportMode, commute_monthly: commuteMonthly,
      hours_week: hoursWeek, drivers, toggles,
      dependents_monthly: dependentsMonthly, healthcare_monthly: healthcareMonthly,
      debt_monthly: debtMonthly, savings_monthly: savingsMonthly,
      leftover, effective_per_hour: effectivePerHour, maintenance_pct: maintenancePct,
      email: email || null,
    };
    if (DATA_MODE === 'api') {
      const resp = await fetch(INGEST_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) setPostedOnce(true);
    }
  } catch {
    // noop
  }
}

function saveEmail() {
  if (!email) return;
  setEmailSaved(true);
  // Force a second POST that includes the email
  saveResult({ force: true });
}
  useEffect(() => { if (step >= 3) saveResult(); /* post once on reveal */ /* eslint-disable-next-line */ }, [step]);

  // Screens
  const Start = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
            The Real Cost of Working
          </h1>
          <div className="hidden sm:block text-xs text-zinc-500">Anonymous • Estimates only • Not advice</div>
        </div>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-zinc-900 to-zinc-600" />
        <div className="space-y-6 mt-6">
          <p className="text-zinc-700 dark:text-zinc-300">You work hard, try to stay afloat, and tell yourself it’ll all make sense soon.</p>
          <p className="text-zinc-700 dark:text-zinc-300">Between rent, travel, and the quiet cost of keeping yourself presentable and sane, the numbers rarely add up.</p>
          <p className="text-zinc-700 dark:text-zinc-300">This isn’t about budgeting — it’s about reality.</p>
<p className="text-zinc-700 dark:text-zinc-300 font-medium">
  In <span className="font-bold text-lg text-zinc-900 dark:text-white">one minute</span>, you’ll see what your job <em>really</em> pays once you include the cost of doing it. Then decide what’s worth changing.
</p>
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-center text-sm italic bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Find out what your job actually pays.
            </p>
          </div>
          <div className="flex justify-end">
            <button onClick={next} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-rose-600 to-pink-600">
              Start my month
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const CoreInputs = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-sky-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Basics of your month</h2>
          <div className="flex gap-2">
            <button onClick={back} className="px-3 py-2 rounded-lg border">Back</button>
            <button onClick={next} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-amber-600 to-orange-600">Continue</button>
          </div>
        </div>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-amber-400 to-amber-600" />
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="text-sm">Which world feels most like yours?</label>
            <select value={region} onChange={e => setRegion(e.target.value as RegionId)} className="w-full mt-2 rounded-lg border p-2 bg-white dark:bg-zinc-900">
              {regions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">Rough monthly take-home pay</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500">{currency}</span>
              <input
  type="number"
  value={takeHome === 0 ? '' : takeHome}
  onChange={e => {
    const val = e.target.value;
    setTakeHome(val === '' ? 0 : Number(val));
  }}
                     className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-900" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">After tax. Rounded is fine.</p>
          </div>

          <div>
            <label className="text-sm">Your rent or mortgage each month (your share)</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500">{currency}</span>
             <input
  type="number"
  value={housing === 0 ? '' : housing}
  onChange={e => {
    const val = e.target.value;
    setHousingTouched(true);
    setHousing(val === '' ? 0 : Number(val));
  }}
                     className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-900" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Typical for {regions.find(r=>r.id===region)?.label}: {currency}{suggestedHousing(region, household).toLocaleString()} ·{' '}
              <button type="button" className="underline"
                      onClick={() => { setHousing(suggestedHousing(region, household)); setHousingTouched(true); }}>Use this</button>
            </p>
          </div>

          <div>
            <label className="text-sm">Hours you work each week, including commute</label>
            <input type="range" min={30} max={70} step={1} value={hoursWeek}
                   onChange={e => setHoursWeek(Number(e.target.value))}
                   className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1">{hoursWeek} hours / week → ~{hoursPerMonth} per month</div>
          </div>

          <div>
            <label className="text-sm">Getting to work</label>
            <div className="flex gap-2 flex-wrap mt-2">
              <Pill active={transportMode==='pt'} onClick={()=>setTransportMode('pt')}>Public transport</Pill>
              <Pill active={transportMode==='drive'} onClick={()=>setTransportMode('drive')}>Drive / taxi</Pill>
              <Pill active={transportMode==='remote'} onClick={()=>setTransportMode('remote')}>Remote / no commute</Pill>
            </div>
            <div className="text-xs text-zinc-500 mt-1">Commute est.: <Money value={commuteMonthly} currency={currency} /> / month</div>
          </div>

          <div>
            <label className="text-sm">Home setup</label>
            <div className="flex gap-2 flex-wrap mt-2">
              <Pill active={household==='solo'} onClick={()=>setHousehold('solo')}>Flying solo</Pill>
              <Pill active={household==='partner'} onClick={()=>setHousehold('partner')}>With partner</Pill>
              <Pill active={household==='partnerKids'} onClick={()=>setHousehold('partnerKids')}>With partner + kids</Pill>
              <Pill active={household==='singleParent'} onClick={()=>setHousehold('singleParent')}>Single parent</Pill>
              <Pill active={household==='share'} onClick={()=>setHousehold('share')}>House share</Pill>
              <Pill active={household==='family'} onClick={()=>setHousehold('family')}>Back home</Pill>
            </div>
            {(household==='partnerKids' || household==='singleParent') && (
              <div className="text-xs text-zinc-600 mt-2">Estimated children-related monthly costs: <Money value={childCost(region, household)} currency={currency} /></div>
            )}
          </div>

          <div>
            <label className="text-sm">Regular loan / credit repayments each month</label>
            <input type="range" min={0} max={800} step={10} value={debtMonthly}
                   onChange={e => setDebtMonthly(Number(e.target.value))} className="w-full mt-3" />
            <div className="text-xs text-zinc-500 mt-1"><Money value={debtMonthly} currency={currency} /> / month</div>
          </div>

          <div>
            <label className="text-sm">Do you put anything aside?</label>
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={savingsOn} onChange={e => setSavingsOn(e.target.checked)} />
              💰 Savings / pension (~8% of take-home)
            </label>
            {savingsOn && <div className="text-xs text-zinc-500 mt-1">Est. <Money value={Math.round(netMonthly*0.08)} currency={currency} /> / month</div>}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const HumanDrivers = (
    <Card className="max-w-3xl mx-auto bg-gradient-to-b from-white to-rose-50/40 dark:from-zinc-900 dark:to-zinc-900">
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">How you stay okay</h2>
          <div className="flex gap-2">
            <button onClick={back} className="px-3 py-2 rounded-lg border">Back</button>
            <button onClick={next} className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-amber-600 to-orange-600">Continue</button>
          </div>
        </div>
        <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-sky-500 to-cyan-500" />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {(Object.keys(DRIVER_TABLE) as DriverKey[]).map(key => {
            const meta = DRIVER_META[key];
            const lvl  = drivers[key];
            const border = `border-${meta.color}-300`;
            const bg = `bg-${meta.color}-50 dark:bg-${meta.color}-950/30`;
            const titleClr = `text-${meta.color}-800 dark:text-${meta.color}-300`;
            return (
              <div key={key} className={`border rounded-2xl p-4 shadow-sm ${border} ${bg}`}>
                <div className={`text-sm font-medium flex items-center gap-2 ${titleClr}`}>
                  <span className="text-lg" aria-hidden>{meta.emoji}</span>{meta.title}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{meta.sub}</div>
                <div className="flex gap-2 flex-wrap">
                  {(['low','typical','high'] as Level[]).map(level => (
                    <Pill key={level} active={lvl===level} onClick={()=>setDriver(key, level)}>
                      {level==='low'?'Low':level==='typical'?'Typical':'High'}
                    </Pill>
                  ))}
                </div>
                <div className="mt-3 text-xs text-zinc-500">Est. {currency}{DRIVER_TABLE[key][lvl]} / month</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { key:'pet', label:'🐾 Pet costs' },
            { key:'therapy', label:'🧠 Therapy / coaching' },
            { key:'supportOthers', label:'🤝 Support others' },
            { key:'health', label:'💊 Health costs' },
          ] as {key:ToggleKey;label:string}[]).map(t => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={toggles[t.key]} onChange={e => setToggles(o => ({...o, [t.key]: e.target.checked}))} />
              {t.label} <span className="ml-1 text-xs text-zinc-500">({currency}{TOGGLE_TABLE[t.key]}/mo)</span>
            </label>
          ))}
        </div>

        <div className="mt-4 text-xs text-zinc-500">Your current “maintenance” estimate: <Money value={maintenanceSum} currency={currency} /></div>
      </CardBody>
    </Card>
  );

const Reveal = (
  <Card className="max-w-5xl mx-auto bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-900 dark:to-zinc-900">
    <CardBody>

      {/* Header: title + email capture */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Your month, in plain numbers</h2>
          <p className="text-sm text-zinc-500 max-w-md">
            Get your personalised <strong>1-page plan</strong> showing how to keep more each month.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            placeholder="your@email.com — get your free 1-page plan (PDF)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-72 px-4 py-2 rounded-lg border bg-white dark:bg-zinc-900"
          />
          <button
            onClick={saveEmail}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              emailSaved
                ? 'border border-emerald-600 text-emerald-600 bg-white dark:bg-zinc-900'
                : 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
            }`}
          >
            {emailSaved ? 'Email saved' : 'Send my plan (PDF)'}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 italic mt-1 sm:text-right">
        One email. We’ll send your PDF instantly and only occasional tips. No spam.
      </div>

      {/* Body */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-4">
          <div ref={shareRef} className="bg-zinc-900 text-white rounded-2xl p-5 ring-1 ring-rose-300/30 shadow-lg">
            <div className="text-sm text-zinc-300">Real Cost Simulator — {regions.find(r=>r.id===region)?.label}</div>
            <div className="text-3xl font-bold mt-1">You worked {hoursPerMonth} h and kept {currency}{Math.max(0,leftover).toLocaleString()}.</div>
            <div className="text-lg mt-1">
              That’s {currency}{effectivePerHour.toFixed(2)} per hour of freedom
              <span className="align-super text-xs text-zinc-400">*</span>.
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 italic">
              *Calculated as net discretionary pay per actual hour of life traded.
            </div>
            {netMonthly > 0 && (
              <div className="text-sm text-zinc-400 mt-2">
                Out of every {currency}1 you earn, {currency}{(1 - leftover / netMonthly).toFixed(2)} goes to staying employable and functional.
              </div>
            )}

            <div className="mt-6 space-y-2">
              <div className="text-xs text-zinc-400">Breakdown</div>
              <BarChart
                currency={currency}
                net={netMonthly}
                housing={housing}
                commute={commuteMonthly}
                maintenance={maintenanceSum}
                dependents={dependentsMonthly}
                healthcare={healthcareMonthly}
                debt={debtMonthly}
                savings={savingsMonthly}
              />
            </div>
            <div className="mt-6 text-xs text-zinc-400">
              Estimates • Updated {new Date().toLocaleString(undefined,{month:'long', year:'numeric'})}
            </div>
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
            <div className="text-sm">Commute estimate</div>
            <div className="text-2xl font-semibold mt-1"><Money value={commuteMonthly} currency={currency}/> / month</div>
            <div className="text-xs text-zinc-500 mt-2">
              Based on {transportMode==='remote'?'remote': transportMode==='pt'?'public transport':'driving/taxis'} in {regions.find(r=>r.id===region)?.label}.
            </div>
          </CardBody></Card>

          <Card><CardBody>
            <div className="text-sm">Maintenance total</div>
            <div className="text-2xl font-semibold mt-1"><Money value={maintenanceSum} currency={currency}/> / month</div>
            <div className="text-xs text-zinc-500 mt-2">
              Belonging, identity, time trade, comfort, connection, treats, money pressure{Object.values(toggles).some(Boolean)?' + toggles':''}.
            </div>
          </CardBody></Card>

          <Card><CardBody>
            <div className="text-sm">Dependents</div>
            <div className="text-2xl font-semibold mt-1"><Money value={dependentsMonthly} currency={currency}/> / month</div>
            <div className="text-xs text-zinc-500 mt-2">Estimated childcare and kid-related costs based on your region and setup.</div>
          </CardBody></Card>

          {healthcareMonthly>0 && (
            <Card><CardBody>
              <div className="text-sm">Healthcare gap</div>
              <div className="text-2xl font-semibold mt-1"><Money value={healthcareMonthly} currency={currency}/> / month</div>
              <div className="text-xs text-zinc-500 mt-2">Typical insurance/out-of-pocket costs in your region.</div>
            </CardBody></Card>
          )}

          <Card><CardBody>
            <div className="text-sm">Debt repayments</div>
            <div className="text-2xl font-semibold mt-1"><Money value={debtMonthly} currency={currency}/> / month</div>
            <div className="text-xs text-zinc-500 mt-2">Loans, credit cards, BNPL and similar.</div>
          </CardBody></Card>

          {savingsMonthly>0 && (
            <Card><CardBody>
              <div className="text-sm">Savings / pension</div>
              <div className="text-2xl font-semibold mt-1"><Money value={savingsMonthly} currency={currency}/> / month</div>
              <div className="text-xs text-zinc-500 mt-2">Approx. 8% of take-home (you can toggle this in Basics).</div>
            </CardBody></Card>
          )}
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
          <motion.div key={step} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
            {step===0 && Start}
            {step===1 && CoreInputs}
            {step===2 && HumanDrivers}
            {step>=3 && Reveal}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Self-tests ----------
(function runSelfTests(){
  console.assert(currencySymbol('UK')==='£','UK currency £');
  console.assert(currencySymbol('US')==='$','US currency $');
  console.assert(suggestedHousing('UK','share')===800,'UK share rent 800');
  console.assert(suggestedHousing('EU','solo')>0,'EU solo rent > 0');
  let typicalSum=0; (Object.keys(DRIVER_TABLE) as DriverKey[]).forEach(k=>{ typicalSum += DRIVER_TABLE[k].typical; });
  console.assert(typicalSum === (140+110+120+90+120+45+25),'Driver typical sum matches');
  console.assert(computeHealthcare('US')===250,'US healthcare 250');
  console.assert(computeHealthcare('UK')===0,'UK healthcare 0');
  console.assert(computeSavings(2000,true)===160,'8% of 2000 is 160');
  console.assert(computeSavings(2000,false)===0,'Savings off is 0');
})();
