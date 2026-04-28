import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const BodySchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().int().positive().max(1_000_000),
});

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });

  const { userId, amount } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { candles: { increment: amount } },
    select: { id: true, candles: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}
