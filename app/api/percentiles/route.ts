export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string, fallback?: string) {
  const v = process.env[name] ?? (fallback ? process.env[fallback] : undefined);
  return v && v.trim() ? v : undefined;
}

async function readPercentiles() {
  const url = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const service = getEnv("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const key = service ?? anon;
  if (!url || !key) throw new Error("Missing Supabase URL or key");

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("percentiles")
    .select("*")
    .order("p", { ascending: true });

  if (error) throw error;
  return data;
}

export async function GET() {
  try {
    const data = await readPercentiles();
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/percentiles error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
