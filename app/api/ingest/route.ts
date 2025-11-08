// /app/api/ingest/route.ts
export const runtime = "nodejs";

/**
 * Minimal write path:
 * - Requires session_id (from body or rcs_sid cookie).
 * - Upserts ONLY { session_id, email } into public.responses.
 * - Uses service role key (bypasses RLS).
 * - Returns clear diagnostics if anything fails.
 */

type J = Record<string, any>;

function envVal(name: string, fallback?: string) {
  const v = process.env[name] ?? (fallback ? process.env[fallback] : undefined);
  return v && v.trim() ? v : undefined;
}
function cookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}
function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as J;

    // 1) session_id required (payload or cookie)
    const session_id =
      (typeof body.session_id === "string" && body.session_id.trim()) ||
      cookie(req, "rcs_sid");

    if (!session_id) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_session_id" }), { status: 400 });
    }

    // 2) env (must be set in your host)
    const supabaseUrl = envVal("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey  = envVal("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) return new Response(JSON.stringify({ ok: false, reason: "missing_SUPABASE_URL" }), { status: 500 });
    if (!serviceKey)  return new Response(JSON.stringify({ ok: false, reason: "missing_SERVICE_ROLE_KEY" }), { status: 500 });

    // 3) upsert only columns we KNOW exist: session_id, email
    const row: J = { session_id };
    if (typeof body.email === "string" && body.email.trim()) {
      row.email = body.email.trim();
    }

    // Upsert on session_id
    const url = `${supabaseUrl}/rest/v1/responses?on_conflict=session_id&select=id,session_id,email,created_at`;
    const resp = await fetch(url, {
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
      return new Response(JSON.stringify({ ok: false, reason: "db_error", status: resp.status, body: safeParse(text) }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, upserted: safeParse(text) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, reason: "handler_error", detail: String(err?.message ?? err) }), { status: 400 });
  }
}
