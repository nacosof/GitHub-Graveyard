"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Flame, Ghost, Search, Star, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { CandleIcon, FinishedIcon, TombstoneIcon, UnderratedIcon } from "./Icons";

type ScanResponse =
  | {
      error: string;
    }
  | {
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

function normalizeSlug(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/$/, "");
}

export function RepoScanner() {
  const t = useTranslations("RepoScanner");
  const tc = useTranslations("Categories");
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<{ user: null | { username: string; candles: number } }> => {
      const res = await fetch("/api/auth/me");
      return (await res.json()) as { user: null | { username: string; candles: number } };
    },
    staleTime: 10_000,
  });
  const [value, setValue] = useState("");
  const slug = useMemo(() => normalizeSlug(value), [value]);
  const [submitted, setSubmitted] = useState<string>("");

  const isValidSlug = slug.includes("/") && slug.split("/").filter(Boolean).length === 2;

  const scan = useQuery({
    queryKey: ["scan", submitted],
    enabled: submitted.length > 0,
    queryFn: async (): Promise<ScanResponse> => {
      const res = await fetch(`/api/scan?repo=${encodeURIComponent(submitted)}`);
      return (await res.json()) as ScanResponse;
    },
    staleTime: 30_000,
  });

  const data = scan.data && "error" in scan.data ? null : scan.data;
  const error = scan.isError
    ? "Network error"
    : scan.data && "error" in scan.data
      ? scan.data.error
      : null;

  return (
    <div className="gg-pixel-border w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10">
          <Ghost className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="gg-retro text-lg leading-tight">{t("title")}</div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              if (!isValidSlug) return;
              setSubmitted(slug);
            }}
            placeholder={t("placeholder")}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-3 text-sm text-white caret-white outline-none ring-0 placeholder:text-white/40 focus:border-white/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(isValidSlug ? slug : "")}
          disabled={!isValidSlug || scan.isFetching}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {scan.isFetching ? t("scanning") : t("scan")}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-red-100">
            <AlertTriangle className="size-4" />
            {t("errorTitle")}
          </div>
          <div className="mt-1 text-red-100/80">{error}</div>
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <ListingPanel
            repoSlug={`${data.owner}/${data.repo}`}
            isAuthed={!!me.data?.user}
            candlesBalance={me.data?.user?.candles ?? 0}
            onUpdated={() => {
              qc.invalidateQueries({ queryKey: ["listing", `${data.owner}/${data.repo}`] });
              qc.invalidateQueries({ queryKey: ["discover"] });
              qc.invalidateQueries({ queryKey: ["worlds"] });
              qc.invalidateQueries({ queryKey: ["me"] });
            }}
          />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <a
                href={data.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-base font-semibold hover:underline"
              >
                {data.owner}/{data.repo}
              </a>
              <div className="mt-1 line-clamp-2 text-sm text-white/70">{data.description}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
              <Star className="size-4 text-yellow-200" />
              {data.stars.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
              <Flame className="size-4 text-orange-200" />
              {data.openIssuesCount.toLocaleString()} open issues
            </div>
          </div>

          <div className="mt-4 text-xs text-white/60">
            pushedAt: {data.pushedAt ?? "unknown"} • updatedAt: {data.updatedAt ?? "unknown"} •
            recent open-issue activity (30d): {data.recentOpenIssueActivityCount30d}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListingPanel({
  repoSlug,
  isAuthed,
  candlesBalance,
  onUpdated,
}: {
  repoSlug: string;
  isAuthed: boolean;
  candlesBalance: number;
  onUpdated: () => void;
}) {
  const locale = useLocale();
  const tc = useTranslations("Categories");
  const tl = useTranslations("Listing");
  const [open, setOpen] = useState(false);
  const [closingFx, setClosingFx] = useState(false);
  const [draftCategory, setDraftCategory] = useState<
    null | "abandoned" | "finished" | "underrated"
  >(null);
  const [draftAddCandles, setDraftAddCandles] = useState(0);
  const myCandles = useQuery({
    queryKey: ["myCandles", repoSlug],
    enabled: isAuthed,
    queryFn: async (): Promise<{ spent: number; max: number; remaining: number }> => {
      const res = await fetch(`/api/listings/my-candles?repoSlug=${encodeURIComponent(repoSlug)}`);
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as any;
    },
    staleTime: 10_000,
  });
  const listing = useQuery({
    queryKey: ["listing", repoSlug],
    queryFn: async (): Promise<
      | { listing: null }
      | { listing: { id: string; repoSlug: string; category: string; candlesUsd: number } }
    > => {
      const res = await fetch(`/api/listings?repoSlug=${encodeURIComponent(repoSlug)}`);
      return (await res.json()) as any;
    },
    staleTime: 10_000,
  });

  const commit = useMutation({
    mutationFn: async (input: {
      category: "abandoned" | "finished" | "underrated";
      addCandles: number;
    }) => {
      const res = await fetch("/api/listings/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repoSlug, category: input.category, addCandles: input.addCandles }),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as any;
    },
    onSuccess: () => {
      onUpdated();
      listing.refetch();
      myCandles.refetch();
      setDraftAddCandles(0);
      const target = draftCategory;
      setClosingFx(true);
      requestAnimationFrame(() => {
        animateGhostToWorld(target ?? null);
      });
      window.setTimeout(() => {
        setOpen(false);
        setClosingFx(false);
      }, 850);
    },
  });

  const current = listing.data && "listing" in listing.data ? listing.data.listing : null;
  const currentCategory = (current?.category ?? null) as
    | null
    | "abandoned"
    | "finished"
    | "underrated";
  const remainingForListing = myCandles.data?.remaining ?? 5;
  const spentForListing = myCandles.data?.spent ?? 0;
  const maxForListing = myCandles.data?.max ?? 5;

  const categoryIcon = (cat: "abandoned" | "finished" | "underrated") => {
    const cls = "size-4 text-white/80";
    if (cat === "abandoned") return <TombstoneIcon className={cls} width={16} height={16} />;
    if (cat === "finished") return <FinishedIcon className={cls} width={16} height={16} />;
    return <UnderratedIcon className={cls} width={16} height={16} />;
  };

  function animateGhostToWorld(target: null | "abandoned" | "finished" | "underrated") {
    if (!target) return;

    const modal = document.querySelector<HTMLElement>("[data-listing-modal='1']");
    const tab = document.querySelector<HTMLElement>(`[data-world-tab='${target}']`);
    if (!modal || !tab) return;

    document.documentElement.classList.add("gg-scroll-lock");
    document.body.classList.add("gg-scroll-lock");
    const unlockScroll = () => {
      document.documentElement.classList.remove("gg-scroll-lock");
      document.body.classList.remove("gg-scroll-lock");
    };

    const m = modal.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    const startX = m.left + m.width / 2;
    const startY = m.top + m.height / 2;
    const endX = t.left + t.width / 2;
    const endY = t.top + t.height / 2;

    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.left = "0px";
    el.style.top = "0px";
    const size = 64;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.transform = `translate3d(${startX - size / 2}px, ${startY - size / 2}px, 0)`;
    el.style.pointerEvents = "none";
    el.style.zIndex = "60";
    el.style.color = "rgba(255,255,255,0.9)";
    el.style.filter = "drop-shadow(0 0 24px rgba(255,255,255,0.22))";
    el.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
      </svg>
    `;

    document.body.appendChild(el);

    const spawnSparks = () => {
      const r = tab.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        const size = 6 + (i % 3) * 2;
        s.style.position = "fixed";
        s.style.left = `${cx - size / 2}px`;
        s.style.top = `${cy - size / 2}px`;
        s.style.width = `${size}px`;
        s.style.height = `${size}px`;
        s.style.borderRadius = "999px";
        s.style.background = "rgba(255,255,255,0.9)";
        s.style.pointerEvents = "none";
        s.style.zIndex = "60";
        s.style.filter = "drop-shadow(0 0 10px rgba(255,255,255,0.25))";
        document.body.appendChild(s);

        const angle = (Math.PI * 2 * i) / count + (i % 2 ? 0.18 : -0.18);
        const dist = 28 + (i % 5) * 10;
        const dxp = Math.cos(angle) * dist;
        const dyp = Math.sin(angle) * dist - 10;
        const spin = (i % 2 ? 1 : -1) * (20 + (i % 6) * 6);

        const anim = s.animate(
          [
            { transform: "translate3d(0,0,0) scale(1)", opacity: 0 },
            { transform: "translate3d(0,0,0) scale(1)", opacity: 1, offset: 0.12 },
            {
              transform: `translate3d(${dxp}px, ${dyp}px, 0) rotate(${spin}deg) scale(0.8)`,
              opacity: 0,
            },
          ],
          { duration: 520, easing: "cubic-bezier(.2,.9,.2,1)" },
        );
        anim.onfinish = () => s.remove();
      }
    };

    const triggerTabFx = () => {
      tab.classList.remove("gg-world-tab-hit");
      void tab.offsetWidth;
      tab.classList.add("gg-world-tab-hit");
      window.setTimeout(() => {
        tab.classList.remove("gg-world-tab-hit");
        spawnSparks();
      }, 720);
    };

    const dx = endX - startX;
    const dy = endY - startY;
    const flight = el.animate(
      [
        {
          transform: `translate3d(${startX - size / 2}px, ${startY - size / 2}px, 0) scale(1) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate3d(${startX - size / 2 + dx * 0.33}px, ${startY - size / 2 + dy * 0.33 - 90}px, 0) scale(1) rotate(-6deg)`,
          opacity: 1,
        },
        {
          transform: `translate3d(${startX - size / 2 + dx * 0.66}px, ${startY - size / 2 + dy * 0.66 - 55}px, 0) scale(1) rotate(6deg)`,
          opacity: 0.98,
        },
        {
          transform: `translate3d(${endX - size / 2}px, ${endY - size / 2}px, 0) scale(1) rotate(0deg)`,
          opacity: 0,
        },
      ],
      { duration: 3200, easing: "cubic-bezier(.18,.95,.2,1)" },
    );

    window.setTimeout(() => {
      triggerTabFx();
    }, 1150);

    flight.onfinish = () => {
      unlockScroll();
      el.remove();
    };
    flight.oncancel = () => {
      unlockScroll();
      el.remove();
    };
  }

  useEffect(() => {
    if (!open) return;
    setDraftCategory(currentCategory);
    setDraftAddCandles(0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, currentCategory]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex flex-col gap-1 text-xs font-semibold text-white/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-normal text-white/70">
            {tl("categoryLabel")}
          </span>
          <span className="inline-flex items-center gap-1">
            {currentCategory ? categoryIcon(currentCategory) : null}
            <span className="leading-none">
              {tc(((current?.category ?? "unclaimed") as any) ?? "unclaimed")}
            </span>
          </span>
        </div>
        <span className="hidden text-white/35 sm:inline">•</span>
        <div className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-normal text-white/70">
            {tl("candlesLabel")}
          </span>
          <span className="inline-flex items-center gap-1">
            <CandleIcon className="size-4 text-white/70" width={16} height={16} />
            <span className="leading-none">{(current?.candlesUsd ?? 0).toLocaleString()}</span>
          </span>
        </div>
      </div>

      {isAuthed ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {tl("actionsButton")}
          </button>

          {open ? (
            <div
              className="fixed inset-0 z-50"
              role="dialog"
              aria-modal="true"
              aria-label={tl("actionsButton")}
            >
              <button
                type="button"
                className={
                  "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-500 " +
                  (closingFx ? "opacity-0" : "opacity-100")
                }
                onClick={() => (closingFx ? null : setOpen(false))}
                aria-label="Close"
              />

              <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2">
                <div
                  data-listing-modal="1"
                  className={
                    "gg-pixel-border overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d13]/95 shadow-2xl shadow-black/60 transition-all duration-500 ease-out " +
                    (closingFx
                      ? "scale-[0.15] rounded-full opacity-0 blur-sm"
                      : "scale-100 opacity-100")
                  }
                >
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.03] p-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-white/60">{repoSlug}</div>
                      <div className="mt-2 flex flex-col gap-1 text-sm font-semibold text-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                        <div className="inline-flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-normal text-white/70">
                            {tl("categoryLabel")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {draftCategory ? categoryIcon(draftCategory) : null}
                            <span className="leading-none">
                              {tc(((draftCategory ?? "unclaimed") as any) ?? "unclaimed")}
                            </span>
                          </span>
                        </div>
                        <span className="hidden text-white/35 sm:inline">•</span>
                        <div className="inline-flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-normal text-white/70">
                            {tl("candlesLabel")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CandleIcon className="size-4 text-white/80" width={16} height={16} />
                            <span className="leading-none">
                              {((current?.candlesUsd ?? 0) + draftAddCandles).toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => (closingFx ? null : setOpen(false))}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/75 hover:border-white/20 hover:bg-black/30 hover:text-white"
                      aria-label="Close"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-2 text-[11px] font-semibold text-white/60">
                      {tl("categoryLabel")}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(["abandoned", "finished", "underrated"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDraftCategory(c)}
                          className={
                            "inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-xs font-semibold text-white/85 hover:border-white/20 hover:bg-black/25 hover:text-white " +
                            (draftCategory === c ? "border-white/25 bg-white/5" : "")
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            {categoryIcon(c)}
                            {tc(c as any)}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold text-white/60">
                        <div>
                          {tl("candleBalanceLabel")}{" "}
                          {Math.max(0, candlesBalance - (draftAddCandles ?? 0))}
                        </div>
                        <div className="text-white/70">
                          {tl("candleMaxLabel")}{" "}
                          {Math.min(maxForListing, spentForListing + (draftAddCandles ?? 0))}/
                          {maxForListing}
                        </div>
                      </div>

                      {draftCategory && candlesBalance <= 0 ? (
                        <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                          <div className="font-semibold text-white/80">{tl("candleNoCandlesTitle")}</div>
                          <div className="mt-1">{tl("candleNoCandlesText")}</div>
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              window.setTimeout(() => {
                                window.location.href = `/${locale}/profile`;
                              }, 0);
                            }}
                            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-white px-3 text-xs font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                          >
                            {tl("candleTopupCta")}
                          </button>
                        </div>
                      ) : null}

                      {draftCategory && candlesBalance > 0 && remainingForListing <= 0 ? (
                        <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                          <div className="font-semibold text-white/80">{tl("candleLimitTitle")}</div>
                          <div className="mt-1">{tl("candleLimitText")}</div>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        disabled={
                          !draftCategory ||
                          candlesBalance <= 0 ||
                          remainingForListing <= 0 ||
                          draftAddCandles >= Math.min(50, candlesBalance, remainingForListing)
                        }
                        onClick={() =>
                          setDraftAddCandles((v) =>
                            Math.min(Math.min(50, candlesBalance, remainingForListing), v + 1),
                          )
                        }
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-3 text-sm font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
                        title={
                          !draftCategory
                            ? tl("setCategoryFirst")
                            : candlesBalance <= 0
                              ? tl("candleTooltipNoCandles")
                              : remainingForListing <= 0
                                ? tl("candleTooltipLimitReached")
                                : tl("candleTitle")
                        }
                      >
                        <span className="inline-flex items-center leading-none">
                          <span className="leading-none">{tl("candleButtonPrefix")}</span>
                          <CandleIcon
                            className="relative top-[-1px] -ml-[1px] size-5 text-black/80"
                            width={18}
                            height={18}
                          />
                          <span className="ml-1 leading-none">{tl("candleButtonSuffix")}</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          commit.isPending ||
                          !draftCategory ||
                          draftAddCandles > candlesBalance ||
                          draftAddCandles > remainingForListing ||
                          (draftCategory === currentCategory && draftAddCandles === 0)
                        }
                        onClick={() => {
                          if (!draftCategory) return;
                          commit.mutate({ category: draftCategory, addCandles: draftAddCandles });
                        }}
                        className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-semibold text-white/85 transition-colors hover:border-white/20 hover:bg-black/30 disabled:opacity-60"
                      >
                        {commit.isPending ? tl("saving") : tl("applyButton")}
                      </button>

                      {!draftCategory ? (
                        <div className="mt-2 text-xs text-white/60">{tl("setCategoryFirst")}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <a
          href={`/${locale}/login`}
          role="button"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-black/30 hover:text-white active:translate-y-[1px] active:scale-[0.985]"
        >
          {tl("signInCta")}
        </a>
      )}
    </div>
  );
}
