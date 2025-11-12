"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import html2canvas from "html2canvas";

/* Real Cost Simulator — page.tsx */

const INGEST_PATH = "/api/ingest";

/* ---------- Range Input ---------- */
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
  React.useEffect(() => { setInner(value ?? 0); }, [value]);
  const commit = React.useCallback((n: number) => onValue(n), [onValue]);
  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const n = Number((e.currentTarget as HTMLInputElement).value);
    setInner(n);
    if (live) {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => { commit(n); tRef.current = null; }, throttleMs);
    }
  };
  const onPointerUp = () => { if (!live) commit(inner); };
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

/* ---------- Types & Tables ---------- */
type RegionId = "UK" | "EU" | "US" | "OTHER";
type Household = "solo" | "partner" | "partnerKids" | "singleParent" | "share" | "family";
type DriverKey = "belonging" | "identity" | "timeTrade" | "comfort" | "connection" | "treats" | "moneyPressure";
type SpendKey = "pet" | "therapy" | "supportOthers" | "health";
type Urbanicity = "inner" | "city" | "suburban" | "rural";
type CommuteContext = "transitEfficient" | "mixed" | "carDependent";
type ChildAge = "nursery" | "school";
type HealthPlanUS = "employer" | "market" | "none";

interface Region { id: RegionId; label: string; currency: string; commutePT: number; commuteDrive: number; }

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

const DRIVER_TYPICAL: Record<DriverKey, number> = {
  belonging: 140, identity: 110, timeTrade: 120, comfort: 90, connection: 120, treats: 45, moneyPressure: 25,
};

const DRIVER_META: Record<DriverKey, { emoji: string; title: string; sub: string; color: string }> = {
  belonging: { emoji: "🫶", title: "Belonging", sub: "Not being the ghost at work or with friends", color: "rose" },
  identity: { emoji: "👔", title: "Identity", sub: "Looking like you belong where you work", color: "violet" },
  timeTrade: { emoji: "⏱️", title: "Time trade", sub: "When tired, you buy time (delivery, taxis)", color: "amber" },
  comfort: { emoji: "🌙", title: "Comfort", sub: "Pleasant/restorative things", color: "sky" },
