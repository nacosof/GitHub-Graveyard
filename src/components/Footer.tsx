"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurtainTransition } from "@/components/CurtainTransition";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const pathname = usePathname();
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
  }, [pathname]);

  return (
    <footer className="border-t border-white/10 bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wider text-white/60">
              GITHUB GRAVEYARD
            </div>
            <div className="text-sm text-white/70">{t("tagline")}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              className="text-white/70 hover:text-white"
              href={`/${locale}`}
              data-no-curtain="1"
            >
              {t("home")}
            </Link>
            {authed ? (
              <Link
                className="text-white/70 hover:text-white"
                href={`/${locale}/profile`}
                onClick={(e) => {
                  e.preventDefault();
                  curtain.playTo(`/${locale}/profile`);
                }}
              >
                {t("profile")}
              </Link>
            ) : (
              <Link className="text-white/70 hover:text-white" href={`/${locale}/login`}>
                {t("signIn")}
              </Link>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-wider text-white/60">
              {t("builtByLabel")}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative size-9 overflow-hidden rounded-full border border-white/15 bg-white/5">
                <Image
                  src="/avatar.png"
                  alt="Avatar"
                  fill
                  className="object-cover [transform:scale(1.35)]"
                  sizes="36px"
                  priority
                />
              </div>
              <div className="text-sm text-white/80">
                <span className="font-semibold text-white">nacosof</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-3">
            <div className="text-xs font-semibold tracking-wider text-white/60">LEGAL</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                className="text-white/70 hover:text-white"
                href={`/${locale}/privacy`}
              >
                Privacy
              </Link>
              <Link
                className="text-white/70 hover:text-white"
                href={`/${locale}/terms`}
              >
                Terms
              </Link>
              <Link className="text-white/70 hover:text-white" href={`/${locale}/dmca`}>
                DMCA
              </Link>
              <Link
                className="text-white/70 hover:text-white"
                href={`/${locale}/security`}
              >
                Security
              </Link>
            </div>
          </div>

          <div className="md:col-span-3 text-xs text-white/45">
            Support:{" "}
            <a
              className="underline underline-offset-4 hover:text-white"
              href="mailto:nacosof@gmail.com"
            >
              nacosof@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
