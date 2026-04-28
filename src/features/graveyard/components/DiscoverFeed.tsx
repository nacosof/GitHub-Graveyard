"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Flame, Search, Sparkles, Star, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { CandleIcon, FinishedIcon, TombstoneIcon, UnderratedIcon } from "./Icons";

type DiscoverItem = {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  openIssuesCount: number;
  pushedAt: string | null;
  updatedAt: string | null;
  systemStatus: "maintained" | "finished" | "abandoned" | "archived" | "unknown";
  scores: {
    inactivity: number;
    heat: number;
    maturity: number;
  };
  category: "abandoned" | "finished" | "underrated" | null;
  candlesUsd: number;
  reasons: string[];
};

type DiscoverResponse = { items: DiscoverItem[] } | { error: string };

export function DiscoverFeed() {
  const t = useTranslations("Discover");
  const tc = useTranslations("Categories");
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [filter, setFilter] = useState<
    "all" | "unclaimed" | "abandoned" | "finished" | "underrated"
  >("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const key = useMemo(() => q.trim(), [q]);
  const discover = useInfiniteQuery({
    queryKey: ["discover", submitted],
    initialPageParam: 1,
    queryFn: async ({
      pageParam,
    }): Promise<{ items: DiscoverItem[]; hasMore: boolean } | { error: string }> => {
      const qp = new URLSearchParams();
      if (submitted.trim().length > 0) qp.set("q", submitted);
      qp.set("perPage", "10");
      qp.set("page", String(pageParam));
      const res = await fetch(`/api/discover?${qp.toString()}`);
      return (await res.json()) as any;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || "error" in lastPage) return undefined;
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 30_000,
  });
  const canSubmit = !discover.isFetching;

  const items = useMemo(() => {
    const itemsRaw =
      discover.data?.pages?.flatMap((p) => ("items" in p ? p.items : [])).filter(Boolean) ?? [];
    const filtered =
      filter === "all"
        ? itemsRaw
        : filter === "unclaimed"
          ? itemsRaw.filter((x) => !x.category)
          : itemsRaw.filter((x) => x.category === filter);

    return [...filtered].sort((a, b) => b.candlesUsd - a.candlesUsd || b.stars - a.stars);
  }, [discover.data, filter]);

  const error = discover.data?.pages?.some((p) => "error" in p)
    ? (discover.data.pages.find((p) => "error" in p) as any)?.error
    : discover.isError
      ? "Error"
      : null;

  if (error) {
    console.error("[DiscoverFeed] error:", error);
  }

  const activeFilterLabel =
    filter === "all"
      ? t("filterAll")
      : filter === "unclaimed"
        ? t("filterUnclaimed")
        : filter === "abandoned"
          ? t("filterAbandoned")
          : filter === "finished"
            ? t("filterFinished")
            : t("filterUnderrated");

  return (
    <div className="gg-pixel-border w-full max-w-5xl overflow-visible rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="gg-retro flex flex-wrap items-center gap-3 text-lg">
            <Sparkles className="size-5" />
            {t("title")}

            <div className="relative ml-0 w-full sm:ml-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-black/20 px-3 text-xs font-semibold text-white/80 hover:border-white/20 hover:bg-black/15 hover:text-white sm:h-9 sm:w-auto"
                aria-haspopup="menu"
                aria-expanded={filterOpen}
              >
                <span className="text-white/60">{t("filterLabel")}</span>
                <span className="ml-2 text-white">{activeFilterLabel}</span>
              </button>

              {filterOpen ? (
                <div className="absolute left-0 top-10 z-20 w-56 rounded-xl border border-white/10 bg-[#0b0d13]/95 p-2 shadow-lg shadow-black/40 backdrop-blur">
                  {(
                    [
                      ["all", t("filterAll")],
                      ["unclaimed", t("filterUnclaimed")],
                      ["abandoned", t("filterAbandoned")],
                      ["finished", t("filterFinished")],
                      ["underrated", t("filterUnderrated")],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setFilter(id);
                        setFilterOpen(false);
                      }}
                      className={
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white " +
                        (filter === id ? "bg-white/5" : "")
                      }
                      role="menuitem"
                    >
                      <span className="inline-flex items-center gap-2">
                        {id === "abandoned" ? (
                          <TombstoneIcon className="size-4 text-white/80" width={16} height={16} />
                        ) : id === "finished" ? (
                          <FinishedIcon className="size-4 text-white/80" width={16} height={16} />
                        ) : id === "underrated" ? (
                          <UnderratedIcon className="size-4 text-white/80" width={16} height={16} />
                        ) : (
                          <Tag className="h-3 w-3 text-white/70" />
                        )}
                        {label}
                      </span>
                      {filter === id ? <span className="text-white/50">✓</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                setSubmitted(key);
              }}
              className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-black/60 pl-10 pr-3 text-base text-white caret-white outline-none placeholder:text-white/40 focus:border-white/20 sm:h-10 sm:w-[340px] sm:text-sm"
              placeholder={t("placeholder")}
            />
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(key)}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-white px-4 text-base font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 sm:h-10 sm:w-auto sm:text-sm sm:font-medium"
            disabled={!canSubmit}
          >
            {discover.isFetching ? "…" : t("search")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {t("serverError")}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {!error && discover.isFetching && (!discover.data || discover.data.pages.length === 0) ? (
          <>
            <div className="h-[108px] animate-pulse rounded-xl border border-white/10 bg-black/20" />
            <div className="h-[108px] animate-pulse rounded-xl border border-white/10 bg-black/20" />
            <div className="h-[108px] animate-pulse rounded-xl border border-white/10 bg-black/20" />
            <div className="h-[108px] animate-pulse rounded-xl border border-white/10 bg-black/20" />
          </>
        ) : null}

        {!error && !discover.isFetching && items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70 md:col-span-2">
            {t("empty")}
          </div>
        ) : null}

        {items.map((it) => (
          <a
            key={`${it.owner}/${it.repo}`}
            href={it.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {it.owner}/{it.repo}
                </div>
                <div className="mt-1 line-clamp-2 break-words text-xs text-white/70">
                  {it.description}
                </div>
              </div>
              <div className="shrink-0">
                {it.category === "abandoned" ? (
                  <TombstoneIcon
                    className="size-10 text-white/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                    width={40}
                    height={40}
                  />
                ) : it.category === "finished" ? (
                  <FinishedIcon
                    className="size-10 text-white/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                    width={40}
                    height={40}
                  />
                ) : it.category === "underrated" ? (
                  <UnderratedIcon
                    className="size-10 text-white/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                    width={40}
                    height={40}
                  />
                ) : (
                  <Tag className="size-8 text-white/65 drop-shadow-[0_0_14px_rgba(255,255,255,0.06)]" />
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                <Star className="size-4 text-yellow-200" />
                {it.stars.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                <Flame className="size-4 text-orange-200" />
                {it.openIssuesCount.toLocaleString()} issues
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                <CandleIcon className="size-4 text-white/80" width={16} height={16} />
                {t("candles", { amount: it.candlesUsd.toLocaleString() })}
              </span>
            </div>
          </a>
        ))}
      </div>

      {!error ? (
        <div className="mt-4 flex justify-center">
          {discover.hasNextPage ? (
            <button
              type="button"
              onClick={() => discover.fetchNextPage()}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-black/25 px-4 text-sm font-semibold text-white/85 hover:border-white/20 hover:bg-black/20 disabled:opacity-60"
              disabled={discover.isFetchingNextPage}
            >
              {discover.isFetchingNextPage ? "…" : t("loadMore")}
            </button>
          ) : items.length > 0 ? (
            <div className="text-xs text-white/50">{t("end")}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
