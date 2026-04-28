import { NextResponse } from "next/server";
import { z } from "zod";

import bcrypt from "bcryptjs";

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
  email: z.string().trim().email().max(320),
  code: z.string().trim().min(4).max(12),
  newPassword: PasswordSchema,
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
            }
          : null,
      },
      { status: 400 },
    );
  }

  const { email, code, newPassword } = parsed.data;
  const pending = await prisma.passwordReset.findUnique({ where: { email } });
  if (!pending) return NextResponse.json({ errorCode: "NO_PENDING" }, { status: 404 });
  if (pending.expiresAt.getTime() < Date.now()) {
    await prisma.passwordReset.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ errorCode: "CODE_EXPIRED" }, { status: 410 });
  }
  if (pending.code !== code)
    return NextResponse.json({ errorCode: "INVALID_CODE" }, { status: 401 });

  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return NextResponse.json({ errorCode: "NO_ACCOUNT" }, { status: 404 });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash } });
  await prisma.passwordReset.delete({ where: { email } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
