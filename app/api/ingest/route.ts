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

function pick<T extends AnyJson>(src: AnyJson, keys: (keyof T)[]): Partial<T> {
  const out: AnyJson = {};
  for (const k of keys as string[]) {
    if (k in src && src[k] !== undefined) out[k] = src[k];
  }
  return out as Partial<T>;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnyJson;

    // --------- session id (required) ----------
    // from payload (preferred) OR cookie fallback
    const sid =
      (typeof body.session_id === "string" && body.session_id.trim()) ||
      getCookie(req, "rcs_sid");
    if (!sid) {
      return new Response(
        JSON.stringify({ ok: false, error: "session_id required" }),
        { status: 400 }
      );
    }

    // --------- env ----------
    const supabaseUrl = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = getEnv("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl)
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing Supabase URL",
          hint: "Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
        }),
        { status: 500 }
      );
    if (!serviceKey)
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing service role key",
          hint: "Set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY",
        }),
        { status: 500 }
      );

    // ---------- map both old and new client payloads ----------
    // Old names you had in your previous route:
    // region, household, take_home, housing, commute_mode, commute_monthly,
    // hours_week, drivers, toggles, dependents_monthly, healthcare_monthly,
    // debt_monthly, savings_monthly, leftover, effective_per_hour, maintenance_pct, email
    //
    // New page.tsx sends: take_home_input, net_monthly, bills_included, spends, etc.
    // We’ll translate what we can and ignore unknowns (DB will reject unknown columns).
    const normalized: AnyJson = {
      session_id: sid,
      // geography / context
      region: body.region ?? null,
      household: body.household ?? null,
      // income
      take_home:
        body.take_home ??
        body.net_monthly ?? // if you prefer, store actual net instead
        body.take_home_input ??
        null,
      // housing & commute
      housing: body.housing ?? null,
      commute_mode: body.commute_mode ?? body.transport_mode ?? null,
      commute_monthly:
        body.commute_monthly ??
        body.baseline_commute ??
        0,
      hours_week: body.hours_week ?? null,
      // JSON blobs
      drivers: body.drivers ?? null,
      toggles:
        body.toggles ??
        {
          bills_included: body.bills_included ?? null,
          urbanicity: body.urbanicity ?? null,
          commute_context: body.commute_context ?? null,
          savings_rate: body.savings_rate ?? null,
          us_health_plan: body.us_health_plan ?? null,
        },
      // dependents / healthcare / debt / savings
      dependents_monthly: body.dependents_monthly ?? 0,
      healthcare_monthly: body.healthcare_monthly ?? 0,
      debt_monthly: (body.debt_monthly ?? 0) + (body.student_loan ?? 0),
      savings_monthly: body.savings_monthly ?? 0,
      // outcomes
      leftover: body.leftover ?? body.baseline_leftover ?? null,
      effective_per_hour: body.effective_per_hour ?? body.baseline_freedom ?? null,
      maintenance_pct: body.maintenance_pct ?? null,
      // email (don’t overwrite with empty)
      email:
        typeof body.email === "string" && body.email.trim().length > 0
          ? body.email.trim()
          : undefined, // undefined = do not update this column on upsert
      // bookkeeping
      updated_at: new Date().toISOString(),
    };

    // Remove undefined keys so PostgREST won’t try to set them to null
    const row: AnyJson = {};
    for (const [k, v] of Object.entries(normalized)) {
      if (v !== undefined) row[k] = v;
    }

    // ---------- UPSERT by session_id ----------
    // Requires a UNIQUE index/constraint on responses.session_id
    const endpoint = `${supabaseUrl}/rest/v1/responses?on_conflict=session_id`;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        // merge-duplicates => upsert; return=representation => echo updated row
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([row]),
    });

    const text = await resp.text();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "DB upsert failed",
          status: resp.status,
          body: safeParse(text),
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status: resp.status, body: safeParse(text) }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Bad request",
        detail: String(err?.message ?? err),
      }),
      { status: 400 }
    );
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
