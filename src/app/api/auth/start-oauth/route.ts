import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "@/server/auth/session";

const NEXTAUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
];

function getProvider(raw: string | null) {
  const p = (raw ?? "").toLowerCase();
  if (p === "github" || p === "google") return p;
  return null;
}

function normalizeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/")) return "/en";
  return raw;
}

export async function GET(req: NextRequest) {
  const provider = getProvider(req.nextUrl.searchParams.get("provider"));
  if (!provider) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });

  const next = normalizeNext(req.nextUrl.searchParams.get("next"));

  clearAuthCookie();

  const c = cookies();
  for (const name of NEXTAUTH_COOKIE_NAMES) c.delete(name);

  const callbackUrl = `/api/auth/oauth/bridge?next=${encodeURIComponent(next)}`;
  const signInUrl = new URL(`/api/auth/signin/${provider}`, req.url);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(signInUrl);
}

