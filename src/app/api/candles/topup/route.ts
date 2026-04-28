import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

const BodySchema = z.object({
  amount: z.coerce.number().int().min(1).max(1000).default(10),
});

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Top up is disabled in production" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { username: user.username },
    data: { candles: { increment: parsed.data.amount } },
    select: { candles: true },
  });

  return NextResponse.json({ ok: true, candles: updated.candles });
}
