export type ListingCategory = "abandoned" | "finished" | "underrated";

export type Listing = {
  repoSlug: string;
  category: ListingCategory;
  candlesUsd: number;
  createdBy: string;
};

export type ListingVotes = Record<ListingCategory, number> & { total: number };

export function computeMajorityCategory(votes: Map<string, ListingCategory> | undefined) {
  if (!votes || votes.size === 0) return null;

  const counts: Record<ListingCategory, number> = { abandoned: 0, finished: 0, underrated: 0 };
  votes.forEach((v) => {
    counts[v] += 1;
  });

  const order: ListingCategory[] = ["finished", "underrated", "abandoned"];
  let best: ListingCategory = order[0];
  for (const k of order) {
    if (counts[k] > counts[best]) best = k;
  }

  return { category: best, counts, total: votes.size };
}

const globalForStore = globalThis as unknown as {
  ggStore?: {
    listings: Map<string, Listing>;
    votesByRepo: Map<string, Map<string, ListingCategory>>;
  };
};

export const store =
  globalForStore.ggStore ??
  (globalForStore.ggStore = {
    listings: new Map<string, Listing>(),
    votesByRepo: new Map<string, Map<string, ListingCategory>>(),
  });

if (!("votesByRepo" in store) || !(store as any).votesByRepo) {
  (store as any).votesByRepo = new Map<string, Map<string, ListingCategory>>();
}
