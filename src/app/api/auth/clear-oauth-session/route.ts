import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "@/server/auth/session";

const NEXTAUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
];

export async function POST(req: NextRequest) {
  clearAuthCookie();

  const c = cookies();

  const cookieHeader = req.headers.get("cookie") ?? "";
  const namesFromHeader = cookieHeader
    .split(";")
    .map((s) => s.trim().split("=")[0])
    .filter(Boolean);

  for (const name of namesFromHeader) {
    if (name.includes("next-auth")) c.delete(name);
  }

  for (const name of NEXTAUTH_COOKIE_NAMES) c.delete(name);

  return NextResponse.json({ ok: true });
}

