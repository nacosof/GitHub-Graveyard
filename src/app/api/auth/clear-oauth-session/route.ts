import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/server/auth/session";

const NEXTAUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
];

export async function POST() {
  clearAuthCookie();

  const c = cookies();
  for (const name of NEXTAUTH_COOKIE_NAMES) c.delete(name);

  return NextResponse.json({ ok: true });
}

