"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { type Locale } from "@/i18n/config";

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
}

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [uiLocale, setUiLocale] = useState<Locale>(locale);
  const navTimer = useRef<number | null>(null);

  useEffect(() => {
    setUiLocale(locale);
  }, [locale]);

  useEffect(() => {
    return () => {
      if (navTimer.current) window.clearTimeout(navTimer.current);
    };
  }, []);

  const navigate = (targetLocale: Locale) => {
    if (targetLocale === locale) return;

    setUiLocale(targetLocale);

    if (navTimer.current) window.clearTimeout(navTimer.current);
    navTimer.current = window.setTimeout(() => {
      setLocaleCookie(targetLocale);

      const target = pathname.match(/^\/(ru|en)(\/|$)/)
        ? pathname.replace(/^\/(ru|en)(?=\/|$)/, `/${targetLocale}`)
        : `/${targetLocale}${pathname === "/" ? "" : pathname}`;

      router.push(target);
      router.refresh();
    }, 160);
  };

  const active = uiLocale;

  return (
    <div
      className="relative inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm shadow-black/20"
      role="group"
      aria-label="Language"
    >
      <span
        aria-hidden="true"
        className={
          "pointer-events-none absolute left-1 top-1 h-8 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm shadow-black/15 transition-transform duration-300 ease-out"
        }
        style={{ transform: `translateX(${active === "en" ? "100%" : "0%"})` }}
      />
      {(["ru", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => navigate(l)}
          className={
            "relative z-10 h-8 rounded-lg px-3 text-xs font-semibold tracking-wider transition-colors duration-200 " +
            (active === l ? "text-black" : "text-white/80 hover:text-white active:scale-[0.98]")
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
