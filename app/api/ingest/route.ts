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
  const diag: AnyJson = { step: "start" };
  try {
    const body = (await req.json()) as AnyJson;

    // ---- session id (required) ----
    const session_id =
      (typeof body.session_id === "string" && body.session_id.trim()) ||
      getCookie(req, "rcs_sid");
    if (!session_id) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_session_id" }), { status: 400 });
    }

    // ---- env (server-only) ----
    const supabaseUrl = getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey  = getEnv("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_supabase_url" }), { status: 500 });
    }
    if (!serviceKey) {
      return new Response(JSON.stringify({ ok: false, reason: "missing_service_key" }), { status: 500 });
    }

    // ---- minimal upsert payload (only columns we know exist) ----
    const row: AnyJson = { session_id };
    if (typeof body.email === "string" && body.email.trim()) {
      row.email = body.email.trim();
    }

    // Upsert by session_id
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
      return new Response(
        JSON.stringify({ ok: false, reason: "db_error", status: resp.status, body: safeParse(text) }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ ok: true, upserted: safeParse(text) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, reason: "handler_error", detail: String(err?.message ?? err) }), { status: 400 });
  }
}
