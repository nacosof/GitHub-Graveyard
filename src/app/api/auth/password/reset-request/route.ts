import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db";
import { sendEmailCode } from "@/server/email";

const BodySchema = z.object({
  email: z.string().trim().email().max(320),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        errorCode: "INVALID_BODY",
        issue: first ? { path: first.path.join("."), code: (first as any).code } : null,
      },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const exists = !!(await prisma.user.findUnique({ where: { email }, select: { id: true } }));

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.passwordReset.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  });

  if (exists) {
    await sendEmailCode({ to: email, purpose: "reset", code });
  }

  return NextResponse.json({
    ok: true,
    step: "verify",
    email,
    devCode: process.env.NODE_ENV === "production" || !exists ? undefined : code,
  });
}
