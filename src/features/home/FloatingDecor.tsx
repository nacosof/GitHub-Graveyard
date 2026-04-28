"use client";

import { Ghost } from "lucide-react";

function CandleIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 8c4 5 4 10 0 15-4-5-4-10 0-15Z" className="fill-current" opacity="0.9" />
      <path
        d="M26 26h12c2.2 0 4 1.8 4 4v20c0 3.3-2.7 6-6 6H28c-3.3 0-6-2.7-6-6V30c0-2.2 1.8-4 4-4Z"
        className="fill-current"
        opacity="0.8"
      />
      <path
        d="M32 23v6"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M26 40h12"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FinishedIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 14v36"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M22 16h20l-6 6 6 6H22V16Z" className="fill-current" opacity="0.75" />
      <path
        d="M28 44l4 4 8-10"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UnderratedIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 10l12 12-12 32L20 22 32 10Z" className="fill-current" opacity="0.75" />
      <path
        d="M32 10l12 12-12 8-12-8 12-12Z"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M48 34l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" className="fill-current" opacity="0.55" />
    </svg>
  );
}

function TombstoneIcon({
  className,
  style,
  width,
  height,
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 26c0-8.837 5.82-16 13-16s13 7.163 13 16v22H20V26Z"
        className="fill-current"
        opacity="0.9"
      />
      <path d="M16 48h32v6H16v-6Z" className="fill-current" opacity="0.65" />
      <path
        d="M27 29h10"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27 36h10"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Item = {
  id: string;
  kind: "ghost" | "candle" | "tombstone" | "finished" | "underrated";
  left: string;
  top: string;
  size: number;
  opacity: number;
  blur: number;
  fallDur: string;
  fallDelay: string;
  swayDur: string;
  swayDelay: string;
};

const items: Item[] = [
  {
    id: "g1",
    kind: "ghost",
    left: "6%",
    top: "0%",
    size: 42,
    opacity: 0.14,
    blur: 0.35,
    fallDur: "22s",
    fallDelay: "-6s",
    swayDur: "7s",
    swayDelay: "-2s",
  },
  {
    id: "t1",
    kind: "tombstone",
    left: "86%",
    top: "0%",
    size: 54,
    opacity: 0.1,
    blur: 0.6,
    fallDur: "28s",
    fallDelay: "-18s",
    swayDur: "9s",
    swayDelay: "-4s",
  },
  {
    id: "f1",
    kind: "candle",
    left: "12%",
    top: "0%",
    size: 34,
    opacity: 0.12,
    blur: 0.5,
    fallDur: "18s",
    fallDelay: "-10s",
    swayDur: "6.5s",
    swayDelay: "-1s",
  },
  {
    id: "g2",
    kind: "ghost",
    left: "78%",
    top: "0%",
    size: 40,
    opacity: 0.12,
    blur: 0.7,
    fallDur: "24s",
    fallDelay: "-2s",
    swayDur: "8s",
    swayDelay: "-6s",
  },
  {
    id: "g3",
    kind: "ghost",
    left: "28%",
    top: "0%",
    size: 34,
    opacity: 0.1,
    blur: 0.8,
    fallDur: "20s",
    fallDelay: "-14s",
    swayDur: "7.5s",
    swayDelay: "-3s",
  },
  {
    id: "t2",
    kind: "tombstone",
    left: "42%",
    top: "0%",
    size: 46,
    opacity: 0.08,
    blur: 0.9,
    fallDur: "30s",
    fallDelay: "-21s",
    swayDur: "10s",
    swayDelay: "-8s",
  },
  {
    id: "f2",
    kind: "candle",
    left: "60%",
    top: "0%",
    size: 30,
    opacity: 0.11,
    blur: 0.6,
    fallDur: "17s",
    fallDelay: "-7s",
    swayDur: "6s",
    swayDelay: "-5s",
  },
  {
    id: "g4",
    kind: "ghost",
    left: "92%",
    top: "0%",
    size: 30,
    opacity: 0.09,
    blur: 0.95,
    fallDur: "26s",
    fallDelay: "-12s",
    swayDur: "9.5s",
    swayDelay: "-1s",
  },
  {
    id: "t3",
    kind: "tombstone",
    left: "18%",
    top: "0%",
    size: 40,
    opacity: 0.07,
    blur: 1.1,
    fallDur: "33s",
    fallDelay: "-25s",
    swayDur: "11s",
    swayDelay: "-2s",
  },
  {
    id: "f3",
    kind: "candle",
    left: "72%",
    top: "0%",
    size: 26,
    opacity: 0.1,
    blur: 0.8,
    fallDur: "19s",
    fallDelay: "-15s",
    swayDur: "6.8s",
    swayDelay: "-4s",
  },
  {
    id: "g5",
    kind: "ghost",
    left: "50%",
    top: "0%",
    size: 38,
    opacity: 0.11,
    blur: 0.85,
    fallDur: "23s",
    fallDelay: "-9s",
    swayDur: "8.4s",
    swayDelay: "-7s",
  },
  {
    id: "g6",
    kind: "ghost",
    left: "2%",
    top: "0%",
    size: 28,
    opacity: 0.08,
    blur: 1.2,
    fallDur: "27s",
    fallDelay: "-19s",
    swayDur: "9.2s",
    swayDelay: "-5s",
  },
  {
    id: "t4",
    kind: "tombstone",
    left: "66%",
    top: "0%",
    size: 44,
    opacity: 0.08,
    blur: 1.0,
    fallDur: "31s",
    fallDelay: "-8s",
    swayDur: "10.6s",
    swayDelay: "-6s",
  },
  {
    id: "f4",
    kind: "candle",
    left: "34%",
    top: "0%",
    size: 24,
    opacity: 0.09,
    blur: 0.9,
    fallDur: "16s",
    fallDelay: "-11s",
    swayDur: "6.2s",
    swayDelay: "-3s",
  },
  {
    id: "g7",
    kind: "ghost",
    left: "82%",
    top: "0%",
    size: 32,
    opacity: 0.09,
    blur: 1.0,
    fallDur: "25s",
    fallDelay: "-22s",
    swayDur: "8.8s",
    swayDelay: "-1.5s",
  },
  {
    id: "t5",
    kind: "tombstone",
    left: "96%",
    top: "0%",
    size: 36,
    opacity: 0.06,
    blur: 1.25,
    fallDur: "36s",
    fallDelay: "-30s",
    swayDur: "12s",
    swayDelay: "-9s",
  },
  {
    id: "f5",
    kind: "candle",
    left: "8%",
    top: "0%",
    size: 22,
    opacity: 0.085,
    blur: 1.0,
    fallDur: "15s",
    fallDelay: "-4s",
    swayDur: "5.8s",
    swayDelay: "-2.2s",
  },
  {
    id: "g8",
    kind: "ghost",
    left: "58%",
    top: "0%",
    size: 26,
    opacity: 0.075,
    blur: 1.15,
    fallDur: "21s",
    fallDelay: "-16s",
    swayDur: "7.8s",
    swayDelay: "-6.6s",
  },
  {
    id: "fin1",
    kind: "finished",
    left: "24%",
    top: "0%",
    size: 30,
    opacity: 0.085,
    blur: 0.85,
    fallDur: "24s",
    fallDelay: "-13s",
    swayDur: "9.4s",
    swayDelay: "-3.1s",
  },
  {
    id: "fin2",
    kind: "finished",
    left: "74%",
    top: "0%",
    size: 26,
    opacity: 0.075,
    blur: 1.05,
    fallDur: "29s",
    fallDelay: "-20s",
    swayDur: "10.2s",
    swayDelay: "-6.8s",
  },
  {
    id: "und1",
    kind: "underrated",
    left: "40%",
    top: "0%",
    size: 28,
    opacity: 0.08,
    blur: 0.95,
    fallDur: "26s",
    fallDelay: "-9s",
    swayDur: "9.8s",
    swayDelay: "-4.7s",
  },
  {
    id: "und2",
    kind: "underrated",
    left: "90%",
    top: "0%",
    size: 24,
    opacity: 0.07,
    blur: 1.1,
    fallDur: "32s",
    fallDelay: "-27s",
    swayDur: "11.1s",
    swayDelay: "-8.4s",
  },
];

export function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((it) => {
        const style = {
          left: it.left,
          top: it.top,
          opacity: it.opacity,
          filter: `blur(${it.blur}px)`,
          ["--gg-fall-dur" as any]: it.fallDur,
          ["--gg-fall-delay" as any]: it.fallDelay,
          ["--gg-sway-dur" as any]: it.swayDur,
          ["--gg-sway-delay" as any]: it.swayDelay,
        } as React.CSSProperties;

        const fallClass = "absolute gg-fall drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]";
        const innerClass = "gg-sway text-white/90";

        if (it.kind === "ghost") {
          return (
            <div key={it.id} className={fallClass} style={style}>
              <Ghost className={innerClass} width={it.size} height={it.size} />
            </div>
          );
        }
        if (it.kind === "candle") {
          return (
            <div key={it.id} className={fallClass} style={style}>
              <CandleIcon className={innerClass} width={it.size} height={it.size} />
            </div>
          );
        }
        if (it.kind === "finished") {
          return (
            <div key={it.id} className={fallClass} style={style}>
              <FinishedIcon className={innerClass} width={it.size} height={it.size} />
            </div>
          );
        }
        if (it.kind === "underrated") {
          return (
            <div key={it.id} className={fallClass} style={style}>
              <UnderratedIcon className={innerClass} width={it.size} height={it.size} />
            </div>
          );
        }
        return (
          <div key={it.id} className={fallClass} style={style}>
            <TombstoneIcon className={innerClass} width={it.size} height={it.size} />
          </div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/35" />
    </div>
  );
}
