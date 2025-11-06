export const runtime = 'nodejs';

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const url = `${process.env.SUPABASE_URL}/rest/v1/responses`;
    const service = process.env.SUPABASE_SERVICE_KEY;

    if (!process.env.SUPABASE_URL || !service) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 });
    }

    const row = {
      created_at: new Date().toISOString(),
      region: body.region,
      household: body.household,
      take_home: body.take_home,
      housing: body.housing,
      commute_mode: body.commute_mode,
      commute_monthly: body.commute_monthly,
      hours_week: body.hours_week,
      drivers: body.drivers,
      toggles: body.toggles,
      dependents_monthly: body.dependents_monthly,
      healthcare_monthly: body.healthcare_monthly,
      debt_monthly: body.debt_monthly,
      savings_monthly: body.savings_monthly,
      leftover: body.leftover,
      effective_per_hour: body.effective_per_hour,
      maintenance_pct: body.maintenance_pct,
      email: body.email ?? null,
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: service,
        Authorization: `Bearer ${service}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([row]),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: 'DB insert failed', text }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Bad request', detail: String(err) }), { status: 400 });
  }
}
