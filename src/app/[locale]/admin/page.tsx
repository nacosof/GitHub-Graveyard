"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { type Locale } from "@/i18n/config";

type Stats = { registeredUsers: number; onlineUsers: number; onlineWindowMinutes: number };

export default function AdminDashboardPage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const ta = useTranslations("Admin");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setError(null);
      const r = await fetch("/api/admin/stats").catch(() => null);
      if (!alive) return;
      if (!r?.ok) {
        router.replace(`/${locale}/profile`);
        return;
      }
      const body = (await r.json().catch(() => null)) as Stats | null;
      if (!alive) return;
      if (!body) {
        setError(ta("failedToLoadStats"));
        return;
      }
      setStats(body);
    };
    load();
    const id = setInterval(load, 10_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [locale, router, ta]);

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">{ta("dashboardTitle")}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/admin/users`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
            >
              {ta("manageUsersTitle")}
            </Link>
            <Link
              href={`/${locale}/profile`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
            >
              Profile
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold tracking-wider text-white/60">SITE</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs font-semibold text-white/60">{ta("onlineNow")}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {stats ? stats.onlineUsers : "—"}
              </div>
              <div className="mt-1 text-xs text-white/45">
                {ta("activeLastMinutes", { minutes: stats ? stats.onlineWindowMinutes : "—" })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs font-semibold text-white/60">{ta("registered")}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {stats ? stats.registeredUsers : "—"}
              </div>
              <div className="mt-1 text-xs text-white/45">{ta("allUsers")}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
