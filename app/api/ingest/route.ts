export const runtime = 'nodejs';

type Payload = Record<string, any>;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 });
    }
    if (!body?.session_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
    }

    // Upsert on session_id so second POST overwrites first
    const resp = await fetch(`${url}/rest/v1/responses?on_conflict=session_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([body]),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: 'DB upsert failed', detail: text }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Bad request', detail: String(e) }), { status: 400 });
  }
}
