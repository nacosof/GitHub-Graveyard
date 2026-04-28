"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LanguageToggle } from "@/features/i18n/LanguageToggle";
import { type Locale } from "@/i18n/config";
import { useCurtainTransition } from "@/components/CurtainTransition";

export function HomeHero() {
  const t = useTranslations("Home");
  const ta = useTranslations("Auth");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const curtain = useCurtainTransition();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setAuthed(!!data?.user);
      })
      .catch(() => {
        if (!alive) return;
        setAuthed(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex items-start justify-between gap-6">
      <header className="flex flex-col gap-3">
        <div className="gg-retro text-xs font-semibold tracking-wider text-white/70">
          {t("kicker")}
        </div>
        <h1 className="gg-pixel-title text-balance text-4xl leading-[1.05] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-pretty text-base text-white/70">{t("subtitle")}</p>
      </header>

      <div className="shrink-0 pt-1">
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={async () => {
              if (authed === true) {
                curtain.playTo(`/${locale}/profile`);
                return;
              }
              curtain.playTo(`/${locale}/login`);
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-xs font-semibold tracking-wider text-white/85 hover:border-white/20 hover:bg-black/30"
          >
            {authed === true ? ta("profile") : ta("signIn")}
          </button>

          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
