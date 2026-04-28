import { githubClient } from "@/server/github/client";

type RepoMeta = {
  stars: number;
  openIssuesCount: number;
  fetchedAt: number;
};

const TTL_MS = 6 * 60 * 60 * 1000;

const globalForCache = globalThis as unknown as {
  ggRepoMetaCache?: Map<string, RepoMeta>;
};

const cache = globalForCache.ggRepoMetaCache ?? (globalForCache.ggRepoMetaCache = new Map());

export async function getRepoMeta(repoSlug: string): Promise<Omit<RepoMeta, "fetchedAt">> {
  const now = Date.now();
  const cached = cache.get(repoSlug);
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return { stars: cached.stars, openIssuesCount: cached.openIssuesCount };
  }

  const [owner, repo] = repoSlug.split("/", 2);
  const gh = githubClient();
  const res = await gh.rest.repos.get({ owner, repo });
  const meta: RepoMeta = {
    stars: res.data.stargazers_count ?? 0,
    openIssuesCount: res.data.open_issues_count ?? 0,
    fetchedAt: now,
  };
  cache.set(repoSlug, meta);
  return { stars: meta.stars, openIssuesCount: meta.openIssuesCount };
}
