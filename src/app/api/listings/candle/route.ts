import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

const BodySchema = z.object({
  repoSlug: z.string().min(3),
});

const MAX_PER_USER = 5;

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { id: true, candles: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (dbUser.candles < 1) {
    return NextResponse.json({ error: "Not enough candles" }, { status: 402 });
  }

  const listing = await prisma.listing.findUnique({
    where: { repoSlug: parsed.data.repoSlug },
    select: { id: true, candlesUsd: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found. Set category first." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const agg = await tx.candleContribution.aggregate({
      where: { userId: dbUser.id, listingId: listing.id },
      _sum: { amountUsd: true },
    });
    const spent = agg._sum.amountUsd ?? 0;
    if (spent >= MAX_PER_USER) {
      return { error: "CANDLE_LIMIT_REACHED" as const, spent };
    }

    await tx.user.update({
      where: { id: dbUser.id },
      data: { candles: { decrement: 1 } },
      select: { id: true },
    });

    await tx.candleContribution.create({
      data: {
        listingId: listing.id,
        userId: dbUser.id,
        amountUsd: 1,
        source: "candle_endpoint",
      },
      select: { id: true },
    });

    const next = await tx.listing.update({
      where: { id: listing.id },
      data: { candlesUsd: { increment: 1 } },
      select: { candlesUsd: true },
    });

    return { ok: true as const, candlesUsd: next.candlesUsd, spent: spent + 1 };
  });

  if ("error" in updated) {
    return NextResponse.json(
      { error: updated.error, maxPerUser: MAX_PER_USER, spent: updated.spent },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    totalUsd: updated.candlesUsd,
    spent: updated.spent,
    maxPerUser: MAX_PER_USER,
  });
}
