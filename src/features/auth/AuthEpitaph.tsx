"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export type AuthEpitaphMood = "idle" | "loading" | "error" | "success";

type Props = {
  mood: AuthEpitaphMood;
  className?: string;
};

function pick(arr: string[]) {
  if (!arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

export function AuthEpitaph({ mood, className }: Props) {
  const t = useTranslations("Auth");

  const pool = useMemo(() => {
    const key =
      mood === "loading"
        ? "epitaphLoading"
        : mood === "error"
          ? "epitaphError"
          : mood === "success"
            ? "epitaphSuccess"
            : "epitaphIdle";

    const raw = t.raw(key) as unknown;
    return Array.isArray(raw)
      ? (raw as string[]).filter((s) => typeof s === "string" && s.trim())
      : [];
  }, [mood, t]);

  const [text, setText] = useState<string>(() => pool[0] ?? "");

  useEffect(() => {
    setText(pick(pool));
  }, [pool]);

  if (!text) return null;

  return (
    <div
      className={[
        "mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[11px] font-semibold tracking-wide text-white/60 backdrop-blur",
        mood === "error" ? "border-red-500/25 bg-red-500/10 text-red-100/80" : "",
        mood === "success" ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-50/80" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      {text}
    </div>
  );
}
