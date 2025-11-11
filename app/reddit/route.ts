import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/", url.origin);
  target.searchParams.set("utm_source", "reddit");
  target.searchParams.set("utm_medium", "social");
  target.searchParams.set("utm_campaign", "launch");

  const res = NextResponse.redirect(target, 302);
  res.cookies.set("rcs_src", "reddit", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}