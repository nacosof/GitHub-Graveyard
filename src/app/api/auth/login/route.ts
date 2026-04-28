import { NextResponse } from "next/server";
import { z } from "zod";

import bcrypt from "bcryptjs";

import { prisma } from "@/server/db";
import { setAuthCookie } from "@/server/auth/session";

const BodySchema = z.object({
  username: z.string().min(1), // can be username or email
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { username, password } = parsed.data;

  const u = username.includes("@")
    ? await prisma.user.findUnique({ where: { email: username.trim() } })
    : await prisma.user.findUnique({ where: { username: username.trim() } });

  if (!u) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!u.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  if (!u.verified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  setAuthCookie(u.username);
  return NextResponse.json({ ok: true, user: { username: u.username } });
}
