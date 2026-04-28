import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/server/auth/session";

export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
