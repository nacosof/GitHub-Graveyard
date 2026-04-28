import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { ListingCategory } from "@prisma/client";

const BodySchema = z.object({
  repoSlug: z.string().min(3),
  category: z.enum(["abandoned", "finished", "underrated"]),
  addCandles: z.coerce.number().int().min(0).max(50).optional(),
});

const MAX_PER_USER = 5;

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const repoSlug = parsed.data.repoSlug;
  const category = parsed.data.category as ListingCategory;
  const addCandles = parsed.data.addCandles ?? 0;

  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { id: true, candles: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (addCandles > 0 && dbUser.candles < addCandles) {
    return NextResponse.json({ error: "Not enough candles" }, { status: 402 });
  }

  const listing = await prisma.listing.upsert({
    where: { repoSlug },
    update: {},
    create: {
      repoSlug,
      category,
      createdByUserId: dbUser.id,
    },
    select: { id: true, repoSlug: true, category: true, candlesUsd: true },
  });

  const updated = await prisma.$transaction(async (tx) => {
    if (addCandles > 0) {
      const agg = await tx.candleContribution.aggregate({
        where: { userId: dbUser.id, listingId: listing.id },
        _sum: { amountUsd: true },
      });
      const spent = agg._sum.amountUsd ?? 0;
      if (spent >= MAX_PER_USER) {
        return { error: "CANDLE_LIMIT_REACHED" as const, maxPerUser: MAX_PER_USER, spent };
      }
      if (spent + addCandles > MAX_PER_USER) {
        return {
          error: "CANDLE_LIMIT_EXCEEDED" as const,
          maxPerUser: MAX_PER_USER,
          spent,
          remaining: Math.max(0, MAX_PER_USER - spent),
        };
      }
    }

    await tx.listingVote.upsert({
      where: { listingId_userId: { listingId: listing.id, userId: dbUser.id } },
      update: { category },
      create: { listingId: listing.id, userId: dbUser.id, category },
      select: { id: true },
    });

    const grouped = await tx.listingVote.groupBy({
      by: ["category"],
      where: { listingId: listing.id },
      _count: { _all: true },
    });

    let abandoned = 0;
    let finished = 0;
    let underrated = 0;
    for (const g of grouped) {
      const n = g._count._all;
      if (g.category === "abandoned") abandoned = n;
      if (g.category === "finished") finished = n;
      if (g.category === "underrated") underrated = n;
    }
    const total = abandoned + finished + underrated;

    const majorityCategory: ListingCategory =
      finished >= underrated && finished >= abandoned
        ? "finished"
        : underrated >= abandoned
          ? "underrated"
          : "abandoned";

    if (addCandles > 0) {
      await tx.user.update({
        where: { id: dbUser.id },
        data: { candles: { decrement: addCandles } },
        select: { id: true },
      });

      await tx.candleContribution.create({
        data: {
          listingId: listing.id,
          userId: dbUser.id,
          amountUsd: addCandles,
          source: "commit_endpoint",
        },
        select: { id: true },
      });
    }

    const nextListing = await tx.listing.update({
      where: { id: listing.id },
      data: {
        category: majorityCategory,
        candlesUsd: { increment: addCandles },
      },
      select: { repoSlug: true, category: true, candlesUsd: true },
    });

    return {
      listing: nextListing,
      votes: { abandoned, finished, underrated, total },
    };
  });

  if ("error" in updated) {
    return NextResponse.json(updated, { status: 409 });
  }

  return NextResponse.json(updated);
}
