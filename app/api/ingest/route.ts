// /app/api/ingest/route.ts
export const runtime = "nodejs";

type J = Record<string, any>;
const TABLE = "responses";
const SCHEMA = "public";

function envVal(name: string, fallback?: string) {
  const v = process.env[name] ?? (fallback ? process.env[fallback] : undefined);
  return v && v.trim() ? v : undefined;
}
function cookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}
function cleanRow(row: J) {
  // remove undefined and NaN; keep nulls
  const out: J = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined) continue;
    if (typeof v === "number" && !Number.isFinite(v)) { out[k] = null; continue; }
    out[k] = v;
  }
  return out;
}
function safeParse(s: string) { try { return JSON.parse(s); } catch { return s; } }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as J;

    // REQUIRE a session id (payload or cookie)
    const session_id =
      (typeof body.session_id === "string" && body.session_id.trim()) ||
      cookie(req, "rcs_sid");
    if (!session_id) {
      return new Response(JSON.stringify({ ok:false, reason:"missing_session_id" }), { status: 400 });
    }

    const supabaseUrl = envVal("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey  = envVal("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) return new Response(JSON.stringify({ ok:false, reason:"missing_SUPABASE_URL" }), { status: 500 });
    if (!serviceKey)  return new Response(JSON.stringify({ ok:false, reason:"missing_SERVICE_ROLE_KEY" }), { status: 500 });

    // Map ONLY the columns that exist in your table
    const row = cleanRow({
      session_id,
      email: (typeof body.email === "string" && body.email.trim()) ? body.email.trim() : undefined,
      region: body.region ?? null,
      household: body.household ?? null,
      take_home: body.take_home ?? null,
      housing: body.housing ?? null,
      commute_mode: body.commute_mode ?? null,
      commute_monthly: body.commute_monthly ?? null,
      hours_week: body.hours_week ?? null,
      drivers: body.drivers ?? null,     // expect object -> JSONB
      toggles: body.toggles ?? null,     // expect object -> JSONB
      dependents_monthly: body.dependents_monthly ?? null,
      healthcare_monthly: body.healthcare_monthly ?? null,
      debt_monthly: body.debt_monthly ?? null,
      savings_monthly: body.savings_monthly ?? null,
      leftover: body.leftover ?? null,
      effective_per_hour: body.effective_per_hour ?? null,
      maintenance_pct: body.maintenance_pct ?? null,
      // optional: capture UA/IP if you want, otherwise omit
      ua: body.ua ?? null,
      ip_hash: body.ip_hash ?? null,
    });

    const endpoint = `${supabaseUrl}/rest/v1/${TABLE}?on_conflict=session_id&select=id,session_id,email,created_at`;
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "resolution=merge-duplicates,return=representation",
        "Content-Profile": SCHEMA,
      },
      body: JSON.stringify([row]),
    });

    const text = await resp.text();
    if (!resp.ok) {
      return new Response(JSON.stringify({ ok:false, reason:"db_error", status: resp.status, body: safeParse(text) }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok:true, upserted: safeParse(text) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok:false, reason:"handler_error", detail:String(err?.message ?? err) }), { status: 400 });
  }
}
