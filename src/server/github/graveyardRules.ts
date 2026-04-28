import { subYears } from "date-fns";

export type GraveyardScanInput = {
  stars: number;
  pushedAt: Date | null;
  openIssuesCount: number;
  hasRecentIssueActivity: boolean;
};

export type GraveyardScanResult = {
  isDeadCandidate: boolean;
  reasons: string[];
  thresholds: {
    minStars: number;
    pushedBefore: string;
  };
};

const MIN_STARS = 10;
const INACTIVE_YEARS = 2;

export function evaluateGraveyardRules(input: GraveyardScanInput): GraveyardScanResult {
  const reasons: string[] = [];

  if (input.stars <= MIN_STARS) {
    reasons.push(`stars ≤ ${MIN_STARS}`);
  }

  const cutoff = subYears(new Date(), INACTIVE_YEARS);
  if (!input.pushedAt) {
    reasons.push("missing pushedAt");
  } else if (input.pushedAt >= cutoff) {
    reasons.push(`last push is newer than ${INACTIVE_YEARS} years`);
  }

  if (input.openIssuesCount < 5) {
    reasons.push("open issues < 5");
  }
  if (!input.hasRecentIssueActivity) {
    reasons.push("no recent issue activity");
  }

  const isDeadCandidate =
    input.stars > MIN_STARS &&
    !!input.pushedAt &&
    input.pushedAt < cutoff &&
    input.openIssuesCount >= 5 &&
    input.hasRecentIssueActivity;

  return {
    isDeadCandidate,
    reasons,
    thresholds: {
      minStars: MIN_STARS,
      pushedBefore: cutoff.toISOString(),
    },
  };
}
