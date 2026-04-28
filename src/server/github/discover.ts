import { subDays, subYears } from "date-fns";

import { env } from "@/env";
import { prisma } from "@/server/db";
import { githubClient } from "@/server/github/client";
import { evaluateRepoStatus, type RepoStatus } from "@/server/github/status";

function normalizeDiscoverQuery(input?: string) {
  const q = input?.trim();
  if (!q) return undefined;

  if (!q.includes(":") && !q.includes(" ")) {
    return `topic:${q}`;
  }

  return q;
}

export type DiscoverResultItem = {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  openIssuesCount: number;
  pushedAt: string | null;
  updatedAt: string | null;
  systemStatus: RepoStatus;
  scores: {
    inactivity: number;
    heat: number;
    maturity: number;
  };
  category: "abandoned" | "finished" | "underrated" | null;
  candlesUsd: number;
  reasons: string[];
};

export async function discoverDeadCandidates(params: {
  query?: string;
  perPage?: number;
  page?: number;
}): Promise<{ items: DiscoverResultItem[]; hasMore: boolean }> {
  const perPage = Math.min(Math.max(params.perPage ?? 10, 1), 20);
  const page = Math.max(params.page ?? 1, 1);
  const gh = githubClient();

  const pushedBefore = subYears(new Date(), 2);
  const qParts = [
    "archived:false",
    "fork:true",
    "stars:>10",
    `pushed:<${pushedBefore.toISOString().slice(0, 10)}`,
  ];
  const normalized = normalizeDiscoverQuery(params.query);
  if (normalized) {
    qParts.push(normalized);
  }

  const search = await gh.rest.search.repos({
    q: qParts.join(" "),
    sort: "stars",
    order: "desc",
    per_page: perPage,
    page,
  });
  const hasMore = (search.data.items?.length ?? 0) >= perPage;

  const recentCutoff = subDays(new Date(), 30);

  const slugs = search.data.items
    .map((r) => `${r.owner?.login ?? "unknown"}/${r.name}`)
    .filter((s) => s !== "unknown/undefined");

  const listingBySlug = new Map<
    string,
    { category: "abandoned" | "finished" | "underrated"; candlesUsd: number }
  >();
  if (slugs.length > 0) {
    const listings = await prisma.listing.findMany({
      where: { repoSlug: { in: slugs } },
      select: { repoSlug: true, category: true, candlesUsd: true },
    });
    for (const l of listings) {
      listingBySlug.set(l.repoSlug, { category: l.category, candlesUsd: l.candlesUsd });
    }
  }

  const fromSearch: DiscoverResultItem[] = search.data.items.map((r) => {
    const pushedAt = r.pushed_at ? new Date(r.pushed_at) : null;
    const updatedAt = r.updated_at ? new Date(r.updated_at) : null;

    const recentOpenIssueActivityCount30d =
      !!updatedAt && updatedAt > recentCutoff ? Math.min(10, (r.open_issues_count ?? 0) / 5) : 0;

    const statusEval = evaluateRepoStatus({
      archived: !!r.archived,
      stars: r.stargazers_count ?? 0,
      pushedAt,
      updatedAt,
      openIssuesCount: r.open_issues_count ?? 0,
      recentOpenIssueActivityCount30d,
      hasReleases: false,
      hasLicense: false,
      hasHomepage: false,
    });

    const slug = `${r.owner?.login ?? "unknown"}/${r.name}`;
    const listing = listingBySlug.get(slug);

    return {
      owner: r.owner?.login ?? "unknown",
      repo: r.name,
      htmlUrl: r.html_url,
      description: r.description,
      stars: r.stargazers_count ?? 0,
      openIssuesCount: r.open_issues_count ?? 0,
      pushedAt: pushedAt ? pushedAt.toISOString() : null,
      updatedAt: updatedAt ? updatedAt.toISOString() : null,
      systemStatus: statusEval.status,
      scores: statusEval.scores,
      category: listing?.category ?? null,
      candlesUsd: listing?.candlesUsd ?? 0,
      reasons: statusEval.reasons,
    };
  });

  const storeSlugsTop =
    page === 1
      ? (
          await prisma.listing.findMany({
            orderBy: { candlesUsd: "desc" },
            take: perPage,
            select: { repoSlug: true },
          })
        ).map((l) => l.repoSlug)
      : [];

  const fromStore: DiscoverResultItem[] = [];
  for (const slug of storeSlugsTop) {
    if (!slug.includes("/")) continue;
    const [owner, repo] = slug.split("/", 2);
    const listing = await prisma.listing.findUnique({
      where: { repoSlug: slug },
      select: { category: true, candlesUsd: true },
    });
    if (!listing) continue;

    if (!env.GITHUB_TOKEN) {
      fromStore.push({
        owner,
        repo,
        htmlUrl: `https://github.com/${owner}/${repo}`,
        description: null,
        stars: 0,
        openIssuesCount: 0,
        pushedAt: null,
        updatedAt: null,
        systemStatus: "unknown",
        scores: { inactivity: 0, heat: 0, maturity: 0 },
        category: listing.category,
        candlesUsd: listing.candlesUsd,
        reasons: ["community-labeled"],
      });
      continue;
    }

    try {
      const repoRes = await gh.rest.repos.get({ owner, repo });
      const r = repoRes.data;
      const pushedAt = r.pushed_at ? new Date(r.pushed_at) : null;
      const updatedAt = r.updated_at ? new Date(r.updated_at) : null;

      const recentOpenIssueActivityCount30d =
        !!updatedAt && updatedAt > recentCutoff ? Math.min(10, (r.open_issues_count ?? 0) / 5) : 0;

      const statusEval = evaluateRepoStatus({
        archived: !!r.archived,
        stars: r.stargazers_count ?? 0,
        pushedAt,
        updatedAt,
        openIssuesCount: r.open_issues_count ?? 0,
        recentOpenIssueActivityCount30d,
        hasReleases: false,
        hasLicense: false,
        hasHomepage: !!r.homepage,
      });

      fromStore.push({
        owner: r.owner?.login ?? owner,
        repo: r.name ?? repo,
        htmlUrl: r.html_url,
        description: r.description,
        stars: r.stargazers_count ?? 0,
        openIssuesCount: r.open_issues_count ?? 0,
        pushedAt: pushedAt ? pushedAt.toISOString() : null,
        updatedAt: updatedAt ? updatedAt.toISOString() : null,
        systemStatus: statusEval.status,
        scores: statusEval.scores,
        category: listing.category,
        candlesUsd: listing.candlesUsd,
        reasons: statusEval.reasons,
      });
    } catch {
    }
  }

  const mergedBySlug = new Map<string, DiscoverResultItem>();
  for (const it of [...fromStore, ...fromSearch]) {
    const slug = `${it.owner}/${it.repo}`;
    if (!mergedBySlug.has(slug)) mergedBySlug.set(slug, it);
  }

  return { items: Array.from(mergedBySlug.values()), hasMore };
}
