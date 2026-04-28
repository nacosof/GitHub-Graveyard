import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { getRepoMeta } from "@/server/github/repoMetaCache";
import { prisma } from "@/server/db";
import { ListingCategory } from "@prisma/client";

const QuerySchema = z.object({
  category: z.enum(["abandoned", "finished", "underrated"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

type WorldItem = {
  owner: string;
  repo: string;
  htmlUrl: string;
  category: ListingCategory;
  candlesUsd: number;
  stars: number;
  openIssuesCount: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    category: url.searchParams.get("category") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const limit = parsed.data.limit ?? 300;
  const category = parsed.data.category;

  const listings = await prisma.listing.findMany({
    where: category ? { category: category as ListingCategory } : undefined,
    orderBy: { candlesUsd: "desc" },
    take: limit,
    select: { repoSlug: true, category: true, candlesUsd: true },
  });

  const items: WorldItem[] = [];

  if (!env.GITHUB_TOKEN) {
    for (const l of listings) {
      const [owner, repo] = l.repoSlug.split("/", 2);
      items.push({
        owner,
        repo,
        htmlUrl: `https://github.com/${l.repoSlug}`,
        category: l.category,
        candlesUsd: l.candlesUsd,
        stars: 0,
        openIssuesCount: 0,
      });
    }
    return NextResponse.json({ items });
  }

  for (const l of listings) {
    const [owner, repo] = l.repoSlug.split("/", 2);
    try {
      const meta = await getRepoMeta(l.repoSlug);
      items.push({
        owner,
        repo,
        htmlUrl: `https://github.com/${l.repoSlug}`,
        category: l.category,
        candlesUsd: l.candlesUsd,
        stars: meta.stars,
        openIssuesCount: meta.openIssuesCount,
      });
    } catch {
      items.push({
        owner,
        repo,
        htmlUrl: `https://github.com/${l.repoSlug}`,
        category: l.category,
        candlesUsd: l.candlesUsd,
        stars: 0,
        openIssuesCount: 0,
      });
    }
  }

  return NextResponse.json({ items });
}
