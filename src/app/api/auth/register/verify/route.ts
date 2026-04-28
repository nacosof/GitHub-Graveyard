import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

const BodySchema = z.object({
  email: z.string().trim().email().max(320),
  code: z.string().trim().min(4).max(12),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errorCode: "INVALID_BODY" }, { status: 400 });

  const { email, code } = parsed.data;
  const pending = await prisma.emailVerification.findUnique({ where: { email } });
  if (!pending) return NextResponse.json({ errorCode: "NO_PENDING" }, { status: 404 });
  if (pending.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerification.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ errorCode: "CODE_EXPIRED" }, { status: 410 });
  }
  if (pending.code !== code)
    return NextResponse.json({ errorCode: "INVALID_CODE" }, { status: 401 });

  const existingByUsername = await prisma.user.findUnique({
    where: { username: pending.username },
    select: { id: true },
  });
  if (existingByUsername) {
    await prisma.emailVerification.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ errorCode: "USERNAME_TAKEN" }, { status: 409 });
  }
  const existingByEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingByEmail) {
    await prisma.emailVerification.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ errorCode: "EMAIL_TAKEN" }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      username: pending.username,
      email,
      passwordHash: pending.passwordHash,
      verified: true,
    },
  });
  await prisma.emailVerification.delete({ where: { email } }).catch(() => null);

  setAuthCookie(pending.username);
  return NextResponse.json({ ok: true, user: { username: pending.username } });
}
