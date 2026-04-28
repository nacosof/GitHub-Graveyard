import { NextResponse } from "next/server";
import { z } from "zod";

import bcrypt from "bcryptjs";

import { sendEmailCode } from "@/server/email";
import { prisma } from "@/server/db";

const PasswordSchema = z
  .string()
  .min(8)
  .max(64)
  .superRefine((val, ctx) => {
    const lowers = (val.match(/[a-z]/g) ?? []).length;
    const uppers = (val.match(/[A-Z]/g) ?? []).length;
    if (lowers < 1 || uppers < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PASSWORD_POLICY" });
    }
  });

const BodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscore"),
  email: z.string().trim().email().max(320),
  password: PasswordSchema,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        errorCode: "INVALID_BODY",
        issue: first
          ? {
              path: first.path.join("."),
              code: (first as any).code,
              minimum: (first as any).minimum,
              validation: (first as any).validation,
            }
          : null,
      },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;
  const existingByUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existingByUsername) {
    return NextResponse.json({ errorCode: "USERNAME_TAKEN" }, { status: 409 });
  }
  const existingByEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingByEmail) {
    return NextResponse.json({ errorCode: "EMAIL_TAKEN" }, { status: 409 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.emailVerification.upsert({
    where: { email },
    update: { username, passwordHash, code, expiresAt },
    create: { email, username, passwordHash, code, expiresAt },
  });

  await sendEmailCode({ to: email, purpose: "verify", code });

  return NextResponse.json({
    ok: true,
    step: "verify",
    email,
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
