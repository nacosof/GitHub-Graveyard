import { differenceInDays, subDays, subYears } from "date-fns";

export type RepoStatus = "maintained" | "finished" | "abandoned" | "archived" | "unknown";

export type RepoScores = {
  inactivity: number;
  heat: number;
  maturity: number;
};

export type StatusEvaluationInput = {
  archived: boolean;
  stars: number;
  openIssuesCount: number;
  pushedAt: Date | null;
  updatedAt: Date | null;
  recentOpenIssueActivityCount30d: number;
  hasReleases: boolean;
  hasLicense: boolean;
  hasHomepage: boolean;
};

export type StatusEvaluation = {
  status: RepoStatus;
  scores: RepoScores;
  reasons: string[];
  thresholds: {
    inactiveDays: number;
    abandonedInactiveDays: number;
    burningIssuesMinOpen: number;
    burningIssuesMinRecent: number;
    finishedMaxOpenIssues: number;
  };
};

const THRESHOLDS = {
  inactiveDays: 180,
  abandonedInactiveDays: 365 * 2,
  burningIssuesMinOpen: 5,
  burningIssuesMinRecent: 1,
  finishedMaxOpenIssues: 4,
} as const;

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function scoreInactivity(pushedAt: Date | null) {
  if (!pushedAt) return 1;
  const days = Math.max(0, differenceInDays(new Date(), pushedAt));
  return clamp01(days / THRESHOLDS.abandonedInactiveDays);
}

function scoreHeat(openIssues: number, recentOpenIssueActivityCount30d: number) {
  const openScore = clamp01(openIssues / 50);
  const recentScore = clamp01(recentOpenIssueActivityCount30d / 10);
  return clamp01(openScore * 0.7 + recentScore * 0.3);
}

function scoreMaturity(
  input: Pick<StatusEvaluationInput, "hasReleases" | "hasLicense" | "hasHomepage">,
) {
  const points = [input.hasReleases, input.hasLicense, input.hasHomepage].filter(Boolean).length;
  return clamp01(points / 3);
}

export function evaluateRepoStatus(input: StatusEvaluationInput): StatusEvaluation {
  const reasons: string[] = [];

  if (input.archived) {
    return {
      status: "archived",
      scores: { inactivity: 1, heat: 0, maturity: 0 },
      reasons: ["archived:true"],
      thresholds: THRESHOLDS,
    };
  }

  const inactivity = scoreInactivity(input.pushedAt);
  const heat = scoreHeat(input.openIssuesCount, input.recentOpenIssueActivityCount30d);
  const maturity = scoreMaturity(input);

  const pushedDaysAgo = input.pushedAt ? differenceInDays(new Date(), input.pushedAt) : null;
  const isMaintained = pushedDaysAgo !== null && pushedDaysAgo <= THRESHOLDS.inactiveDays;

  const isVeryInactive =
    pushedDaysAgo === null || pushedDaysAgo >= THRESHOLDS.abandonedInactiveDays;

  const isBurning =
    input.openIssuesCount >= THRESHOLDS.burningIssuesMinOpen &&
    input.recentOpenIssueActivityCount30d >= THRESHOLDS.burningIssuesMinRecent;

  const isFinishedLike =
    isVeryInactive &&
    !isBurning &&
    (input.hasReleases ||
      input.openIssuesCount <= THRESHOLDS.finishedMaxOpenIssues ||
      (input.updatedAt ? input.updatedAt < subYears(new Date(), 1) : true));

  let status: RepoStatus = "unknown";
  if (isMaintained) status = "maintained";
  else if (isBurning && isVeryInactive) status = "abandoned";
  else if (isFinishedLike) status = "finished";

  if (input.stars === 0) reasons.push("stars = 0 (unknown project)");
  if (!input.pushedAt) reasons.push("missing pushedAt");
  if (pushedDaysAgo !== null && pushedDaysAgo < THRESHOLDS.abandonedInactiveDays)
    reasons.push("last push is newer than 2 years");
  if (input.openIssuesCount < THRESHOLDS.burningIssuesMinOpen)
    reasons.push(`open issues < ${THRESHOLDS.burningIssuesMinOpen}`);
  if (input.recentOpenIssueActivityCount30d < THRESHOLDS.burningIssuesMinRecent)
    reasons.push("no recent open-issue activity (30d)");
  if (input.hasReleases) reasons.push("has releases");
  if (input.hasLicense) reasons.push("has license");
  if (input.hasHomepage) reasons.push("has homepage");
  if (input.updatedAt && input.updatedAt > subDays(new Date(), 30))
    reasons.push("updated recently");

  return {
    status,
    scores: { inactivity, heat, maturity },
    reasons,
    thresholds: THRESHOLDS,
  };
}
