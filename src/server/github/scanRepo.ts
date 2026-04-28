import { formatISO, subDays } from "date-fns";

import { githubClient } from "@/server/github/client";
import { evaluateRepoStatus } from "@/server/github/status";

export type GraveyardRepoScan = {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  openIssuesCount: number;
  pushedAt: string | null;
  updatedAt: string | null;
  recentOpenIssueActivityCount30d: number;
  hasReleases: boolean;
  archived: boolean;
  status: "maintained" | "finished" | "abandoned" | "archived" | "unknown";
  scores: {
    inactivity: number;
    heat: number;
    maturity: number;
  };
  reasons: string[];
  thresholds: {
    inactiveDays: number;
    abandonedInactiveDays: number;
    burningIssuesMinOpen: number;
    burningIssuesMinRecent: number;
    finishedMaxOpenIssues: number;
  };
};

function parseRepoSlug(slug: string) {
  const trimmed = slug
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/$/, "");
  const [owner, repo] = trimmed.split("/");
  if (!owner || !repo) {
    throw new Error("Expected repo in form owner/repo");
  }
  return { owner, repo };
}

export async function scanRepo(slug: string): Promise<GraveyardRepoScan> {
  const { owner, repo } = parseRepoSlug(slug);
  const gh = githubClient();

  const repoResp = await gh.rest.repos.get({ owner, repo });
  const r = repoResp.data;

  const recentCutoff = subDays(new Date(), 30);
  const recentQuery = `repo:${owner}/${repo} is:issue is:open updated:>${formatISO(recentCutoff, {
    representation: "date",
  })}`;

  const recentIssues = await gh.rest.search.issuesAndPullRequests({
    q: recentQuery,
    per_page: 1,
  });

  const hasReleases = await (async () => {
    try {
      await gh.rest.repos.getLatestRelease({ owner, repo });
      return true;
    } catch (e) {
      const status =
        typeof e === "object" && e && "status" in e && typeof (e as any).status === "number"
          ? (e as any).status
          : null;
      if (status === 404) return false;
      throw e;
    }
  })();

  const pushedAt = r.pushed_at ? new Date(r.pushed_at) : null;
  const updatedAt = r.updated_at ? new Date(r.updated_at) : null;
  const openIssuesCount = typeof r.open_issues_count === "number" ? r.open_issues_count : 0;
  const stars = typeof r.stargazers_count === "number" ? r.stargazers_count : 0;
  const recentOpenIssueActivityCount30d = recentIssues.data.total_count ?? 0;

  const statusEval = evaluateRepoStatus({
    archived: !!r.archived,
    stars,
    pushedAt,
    updatedAt,
    openIssuesCount,
    recentOpenIssueActivityCount30d,
    hasReleases,
    hasLicense: !!r.license,
    hasHomepage: !!r.homepage,
  });

  return {
    owner,
    repo,
    htmlUrl: r.html_url,
    description: r.description,
    stars,
    openIssuesCount,
    pushedAt: pushedAt ? pushedAt.toISOString() : null,
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
    recentOpenIssueActivityCount30d,
    hasReleases,
    archived: !!r.archived,
    status: statusEval.status,
    scores: statusEval.scores,
    reasons: statusEval.reasons,
    thresholds: statusEval.thresholds,
  };
}
