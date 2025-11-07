// /app/api/ingest/route.ts
export const runtime = "nodejs";

type Payload = {
  region: string;
  household: string;
  take_home: number;
  housing: number;
  commute_mode: string;
  commute_monthly: number;
  hours_week: number;
  drivers: any;
  toggles: any;
  dependents_monthly: number;
  healthcare_monthly: number;
  debt_monthly: number;
  savings_monthly: number;
  leftover: number;
  effective_per_hour: number;
  maintenance_pct: number;
  email?: string | null;
};

function getEnv(name: string, fallbackName?: string) {
  const v = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  return v && v.trim().length > 0 ? v : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // Accept either your original names or Supabase’s common names
    const supabaseUrl =
      getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey =
      getEnv("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing Supabase URL",
          hint:
            "Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your environment.",
        }),
        { status: 500 }
      );
    }
    if (!serviceKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing service role key",
          hint:
            "Set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY in your environment (server-only).",
        }),
        { status: 500 }
      );
    }

    // Build the row exactly like your original code
    const row = {
      created_at: new Date().toISOString(),
      region: body.region,
      household: body.household,
      take_home: body.take_home,
      housing: body.housing,
      commute_mode: body.commute_mode,
      commute_monthly: body.commute_monthly,
      hours_week: body.hours_week,
      drivers: body.drivers, // should be JSONB in your table
      toggles: body.toggles, // should be JSONB in your table
      dependents_monthly: body.dependents_monthly,
      healthcare_monthly: body.healthcare_monthly,
      debt_monthly: body.debt_monthly,
      savings_monthly: body.savings_monthly,
      leftover: body.leftover,
      effective_per_hour: body.effective_per_hour,
      maintenance_pct: body.maintenance_pct,
      email: body.email ?? null,
    };

    const resp = await fetch(`${supabaseUrl}/rest/v1/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation", // get back error details / inserted rows
      },
      body: JSON.stringify([row]),
    });

    // If PostgREST errors, surface the message so you can fix schema/RLS quickly
    const text = await resp.text();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "DB insert failed",
          status: resp.status,
          body: text,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        status: resp.status,
        body: safeParse(text),
      }),
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
