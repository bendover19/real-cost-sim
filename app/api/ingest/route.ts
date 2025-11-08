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
  tr
