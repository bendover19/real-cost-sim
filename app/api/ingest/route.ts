// /app/api/ingest/route.ts
export const runtime = "nodejs";

type AnyJson = Record<string, any>;

function getEnv(name: string, fallbackName?: string) {
  const v = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  return v && v.trim().length > 0 ? v : undefined;
}
function getCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}
function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnyJson;

    // REQUIRE a session id (from payload or cookie)
    const session_id =
      (typeof body.session_id === "string" && body.session_id.trim()) ||
      getCookie(req, "rcs_sid");

    if (!session_id) {
      return new Response(JSON.stringify({ ok: false, error: "session_id required" }), { status: 400 });
    }

    const supabaseUrl = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = getEnv("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) return new Response(JSON.stringify({ ok: false, error: "Missing Supabase URL" }), { status: 500 });
    if (!serviceKey) return new Response(JSON.stringify({ ok: false, error: "Missing service role key" }), { status: 500 });

    // Map both old & new client keys. Unknown keys are ignored by PostgREST if they don’t exist in table.
    const row: AnyJson = {
      session_id,
      region: body.region ?? null,
      household: body.household ?? null,
      take_home: body.take_home ?? body.net_monthly ?? body.take_home_input ?? null,
      housing: body.housing ?? null,
      commute_mode: body.commute_mode ?? body.transport_mode ?? null,
      commute_monthly: body.commute_monthly ?? body.baseline_commute ?? 0,
      hours_week: body.hours_week ?? null,
      drivers: body.drivers ?? null,
      toggles: body.toggles ?? {
        bills_included: body.bills_included ?? null,
        urbanicity: body.urbanicity ?? null,
        commute_context: body.commute_context ?? null,
        savings_rate: body.savings_rate ?? null,
        us_health_plan: body.us_health_plan ?? null,
      },
      dependents_monthly: body.dependents_monthly ?? 0,
      healthcare_monthly: body.healthcare_monthly ?? 0,
      debt_monthly: (body.debt_monthly ?? 0) + (body.student_loan ?? 0),
      savings_monthly: body.savings_monthly ?? 0,
      leftover: body.leftover ?? body.baseline_leftover ?? null,
      effective_per_hour: body.effective_per_hour ?? body.baseline_freedom ?? null,
      maintenance_pct: body.maintenance_pct ?? null,
      updated_at: new Date().toISOString(),
    };

    // Only set email if it’s non-empty (never overwrite with empty)
    if (typeof body.email === "string" && body.email.trim()) {
      row.email = body.email.trim();
    }

    const resp = await fetch(`${supabaseUrl}/rest/v1/responses?on_conflict=session_id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([row]),
    });

    const text = await resp.text();
    if (!resp.ok) {
      return new Response(JSON.stringify({ ok: false, error: "DB upsert failed", status: resp.status, body: safeParse(text) }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, status: resp.status, body: safeParse(text) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: "Bad request", detail: String(err?.message ?? err) }), { status: 400 });
  }
}
