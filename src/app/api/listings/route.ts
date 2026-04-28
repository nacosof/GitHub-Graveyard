import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { ListingCategory } from "@prisma/client";

const BodySchema = z.object({
  repoSlug: z.string().min(3),
  category: z.enum(["abandoned", "finished", "underrated"]),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const repoSlug = url.searchParams.get("repoSlug");
  if (!repoSlug) return NextResponse.json({ listing: null });

  const listing = await prisma.listing.findUnique({
    where: { repoSlug },
    select: { repoSlug: true, category: true, candlesUsd: true },
  });
  if (!listing) return NextResponse.json({ listing: null });

  return NextResponse.json({
    listing: {
      repoSlug: listing.repoSlug,
      category: listing.category,
      candlesUsd: listing.candlesUsd,
    },
  });
}

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

  const category = parsed.data.category as ListingCategory;
  const repoSlug = parsed.data.repoSlug;
  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.upsert({
    where: { repoSlug },
    update: { category },
    create: {
      repoSlug,
      category,
      createdByUserId: dbUser.id,
    },
    select: { repoSlug: true, category: true, candlesUsd: true },
  });

  return NextResponse.json({ listing });
}
