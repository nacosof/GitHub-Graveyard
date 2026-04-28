import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

const QuerySchema = z.object({
  repoSlug: z.string().min(3),
});

const MAX_PER_USER = 5;

export async function GET(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ repoSlug: url.searchParams.get("repoSlug") });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.findUnique({
    where: { repoSlug: parsed.data.repoSlug },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ spent: 0, max: MAX_PER_USER, remaining: MAX_PER_USER });

  const agg = await prisma.candleContribution.aggregate({
    where: { userId: dbUser.id, listingId: listing.id },
    _sum: { amountUsd: true },
  });

  const spent = agg._sum.amountUsd ?? 0;
  const remaining = Math.max(0, MAX_PER_USER - spent);

  return NextResponse.json({ spent, max: MAX_PER_USER, remaining });
}
