import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { setAuthCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

function normalizeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/")) return "/en";
  return raw;
}

async function bridge() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim();
  if (!email) return { ok: false as const, error: "UNAUTHORIZED" };

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { username: true },
  });
  if (!user?.username) return { ok: false as const, error: "USER_NOT_FOUND" };

  setAuthCookie(user.username);
  return { ok: true as const };
}

export async function POST() {
  const res = await bridge();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const res = await bridge();
  const next = normalizeNext(req.nextUrl.searchParams.get("next"));
  if (!res.ok) {
    const url = new URL("/en/login", req.url);
    url.searchParams.set("error", "OAuthSession");
    return NextResponse.redirect(url);
  }
  const url = new URL(next, req.url);
  return NextResponse.redirect(url);
}
