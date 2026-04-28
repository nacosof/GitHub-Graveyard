"use client";

import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  CandleIcon,
  FinishedIcon,
  TombstoneIcon,
  UnderratedIcon,
} from "@/features/graveyard/components/Icons";

type DiscoverItem = {
  owner: string;
  repo: string;
  htmlUrl: string;
  category: "abandoned" | "finished" | "underrated" | null;
  stars: number;
  openIssuesCount: number;
  candlesUsd: number;
};

type WorldsResponse = { items: DiscoverItem[] } | { error: string };

type WorldKind = "abandoned" | "finished" | "underrated";

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function iconFor(kind: WorldKind, size: number, className: string) {
  if (kind === "abandoned")
    return <TombstoneIcon className={className} width={size} height={size} />;
  if (kind === "finished") return <FinishedIcon className={className} width={size} height={size} />;
  return <UnderratedIcon className={className} width={size} height={size} />;
}

export function CategoryWorlds() {
  const t = useTranslations("Worlds");
  const [open, setOpen] = useState<null | WorldKind>(null);

  return (
    <section className="gg-pixel-border w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="gg-retro text-sm font-semibold text-white/85">{t("title")}</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <WorldButton
            kind="abandoned"
            label={t("tabGraveyard")}
            onClick={() => setOpen("abandoned")}
          />
          <WorldButton
            kind="finished"
            label={t("tabFinished")}
            onClick={() => setOpen("finished")}
          />
          <WorldButton
            kind="underrated"
            label={t("tabUnderrated")}
            onClick={() => setOpen("underrated")}
          />
        </div>
      </div>

      {open ? <WorldModal kind={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function WorldButton({
  kind,
  label,
  onClick,
}: {
  kind: WorldKind;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-world-tab={kind}
      className="gg-world-tab inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-semibold text-white/85 hover:border-white/20 hover:bg-black/30 hover:text-white sm:h-10 sm:w-auto"
    >
      {iconFor(kind, 20, "text-white/80")}
      <span>{label}</span>
    </button>
  );
}

function WorldModal({ kind, onClose }: { kind: WorldKind; onClose: () => void }) {
  const t = useTranslations("Worlds");
  const [scale, setScale] = useState(() => {
    return kind === "underrated" ? 0.76 : kind === "abandoned" ? 0.86 : 0.92;
  });
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hovered, setHovered] = useState<null | {
    slug: string;
    x: number;
    y: number;
    size: number;
    stars: number;
    issues: number;
    candles: number;
  }>(null);

  const worlds = useQuery({
    queryKey: ["worlds", kind],
    queryFn: async (): Promise<WorldsResponse> => {
      const res = await fetch(`/api/worlds?category=${encodeURIComponent(kind)}&limit=500`);
      return (await res.json()) as WorldsResponse;
    },
    staleTime: 30_000,
  });

  const worldsError =
    worlds.data && "error" in worlds.data ? worlds.data.error : worlds.isError ? "Error" : null;

  const items = useMemo(() => {
    const raw = worlds.data && "items" in worlds.data ? worlds.data.items : [];
    return raw;
  }, [worlds.data]);

  const world = useMemo(() => {
    const title =
      kind === "abandoned"
        ? t("tabGraveyard")
        : kind === "finished"
          ? t("tabFinished")
          : t("tabUnderrated");
    return { title };
  }, [kind, t]);

  const canvasW = 2200;
  const canvasH = 1300;

  const active = useMemo(() => {
    if (!activeSlug) return null;
    const [owner, repo] = activeSlug.split("/", 2);
    return { slug: activeSlug, owner, repo, htmlUrl: `https://github.com/${activeSlug}` };
  }, [activeSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = (document.body.style as any).touchAction as string | undefined;
    document.body.style.overflow = "hidden";
    (document.body.style as any).touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      (document.body.style as any).touchAction = prevTouchAction ?? "";
    };
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#05060a]"
      role="dialog"
      aria-modal="true"
      aria-label={world.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="absolute inset-x-0 top-0 z-20 pt-[env(safe-area-inset-top)] sm:inset-x-6 sm:top-6 sm:pt-0">
        <div className="rounded-none border-b border-white/10 bg-[#0b0d13]/95 px-3 py-3 shadow-2xl shadow-black/60 backdrop-blur sm:rounded-2xl sm:border sm:border-b sm:border-white/10 sm:p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-1">
              <div className="gg-retro truncate text-sm font-semibold text-white/90">
                {world.title}
              </div>
              <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-snug text-white/60 sm:whitespace-normal sm:text-xs">
                {t("hint")}
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:border-white/20 hover:bg-black/30 sm:size-10"
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 10) / 10))}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:border-white/20 hover:bg-black/30 sm:size-10"
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:border-white/20 hover:bg-black/30 sm:size-10"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 z-10 touch-none overflow-hidden pt-[124px] [padding-top:calc(env(safe-area-inset-top)+124px)] sm:pt-0"
        onWheel={(e) => {
          const delta = Math.sign(e.deltaY);
          const next = delta > 0 ? scale - 0.08 : scale + 0.08;
          setScale(Math.max(0.6, Math.min(2.2, Math.round(next * 100) / 100)));
        }}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest?.("[data-world-item='1']")) return;
          e.preventDefault();
          dragging.current = true;
          last.current = { x: e.clientX, y: e.clientY };
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          last.current = null;
          (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        }}
        onPointerLeave={() => {
          dragging.current = false;
          last.current = null;
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !last.current) return;
          e.preventDefault();
          const dx = e.clientX - last.current.x;
          const dy = e.clientY - last.current.y;
          last.current = { x: e.clientX, y: e.clientY };
          setTx((v) => v + dx);
          setTy((v) => v + dy);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913] via-[#05060a] to-black" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05), transparent 55%)",
          }}
        />
        <div className="gg-scanlines absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/45" />

        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: canvasW,
            height: canvasH,
            transform: `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <div className="absolute inset-0 rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(0,0,0,0.35)_inset]" />

          {worldsError ? (
            <div className="absolute left-1/2 top-1/2 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-100">
              {worldsError}
            </div>
          ) : null}

          {!worldsError && worlds.isFetching ? (
            <div className="absolute left-1/2 top-1/2 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/40 p-6 text-center text-sm text-white/70">
              {t("loading")}
            </div>
          ) : null}

          {items.map((it) => {
            const slug = `${it.owner}/${it.repo}`;
            const h = hashString(slug);
            const x = 60 + (h % (canvasW - 120));
            const y = 80 + ((h >>> 8) % (canvasH - 160));
            const sway = 6 + ((h >>> 16) % 6);
            const delay = -((h % 8000) / 1000);
            const size = 52 + ((h >>> 20) % 26);

            return (
              <button
                key={slug}
                type="button"
                data-world-item="1"
                onMouseEnter={() =>
                  setHovered({
                    slug,
                    x,
                    y,
                    size,
                    stars: it.stars ?? 0,
                    issues: it.openIssuesCount ?? 0,
                    candles: it.candlesUsd ?? 0,
                  })
                }
                onMouseLeave={() => setHovered((v) => (v?.slug === slug ? null : v))}
                onFocus={() =>
                  setHovered({
                    slug,
                    x,
                    y,
                    size,
                    stars: it.stars ?? 0,
                    issues: it.openIssuesCount ?? 0,
                    candles: it.candlesUsd ?? 0,
                  })
                }
                onBlur={() => setHovered((v) => (v?.slug === slug ? null : v))}
                onClick={() => {
                  setActiveSlug(slug);
                  window.open(it.htmlUrl, "_blank", "noreferrer");
                }}
                className="absolute text-white/85 hover:text-white focus:outline-none"
                style={{
                  left: x,
                  top: y,
                  animation: `gg-float ${sway}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  filter: "drop-shadow(0 0 22px rgba(255,255,255,0.12))",
                }}
              >
                {iconFor(kind, size, "text-white/85")}
              </button>
            );
          })}

          {hovered ? (
            <div
              className="pointer-events-none absolute"
              style={{
                left: hovered.x + hovered.size + 10,
                top: hovered.y + Math.max(0, hovered.size / 2 - 10),
              }}
            >
              <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 shadow-lg shadow-black/50 backdrop-blur">
                <div className="text-xs font-semibold text-white/90">{hovered.slug}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <CandleIcon className="size-4 text-white/75" width={14} height={14} />
                    {hovered.candles.toLocaleString()}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-yellow-200/90">★</span>
                    {hovered.stars.toLocaleString()}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-orange-200/90">⟡</span>
                    {hovered.issues.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
