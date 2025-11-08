// /app/api/ingest/route.ts
export const runtime = "nodejs";

type J = Record<string, any>;
const TABLE = "responses";   // <- your table
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
function safeParse(s: string) { try { return JSON.parse(s); } catch { return s; } }

export async function POST(req: Request) {
  const diag: J = {};
  try {
    const body = (await req.json()) as J;

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

    // DIAGNOSTICS: show which project we’re hitting (the <ref> part of https://<ref>.supabase.co)
    const refMatch = supabaseUrl.match(/^https?:\/\/([^.]+)\.supabase\.co/i);
    const projectRef = refMatch?.[1] ?? "unknown";
    const endpoint = `${supabaseUrl}/rest/v1/${TABLE}?on_conflict=session_id&select=id,session_id,email,created_at`;

    // Minimal payload to avoid schema drift
    const row: J = { session_id };
    if (typeof body.email === "string" && body.email.trim()) row.email = body.email.trim();

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        // service role bypasses RLS; return row(s) we wrote
        Prefer: "resolution=merge-duplicates,return=representation",
        "Content-Profile": SCHEMA,          // be explicit
      },
      body: JSON.stringify([row]),
    });

    const text = await resp.text();
    const parsed = safeParse(text);

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "db_error",
          status: resp.status,
          endpoint,
          projectRef,
          payload: row,
          body: parsed,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        projectRef,
        endpoint,
        payload: row,
        upserted: parsed, // array of rows
      }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok:false, reason:"handler_error", detail:String(err?.message ?? err) }), { status: 400 });
  }
}
