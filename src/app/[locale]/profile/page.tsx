"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useCurtainTransition } from "@/components/CurtainTransition";

type MeResponse =
  | { user: null }
  | {
      user: {
        username: string;
        email: string | null;
        verified: boolean;
        createdAt: string;
        candles: number;
        candlesDonated: number;
        isAdmin: boolean;
      };
    };

export default function ProfilePage() {
  const t = useTranslations("Auth");
  const tp = useTranslations("Profile");
  const locale = useLocale();
  const router = useRouter();
  const curtain = useCurtainTransition();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(10);
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: MeResponse) => {
        if (!alive) return;
        setMe(data);
        setLoading(false);
        if (!data?.user) router.replace(`/${locale}/login`);
      })
      .catch(() => {
        if (!alive) return;
        setMe({ user: null });
        setLoading(false);
        router.replace(`/${locale}/login`);
      });
    return () => {
      alive = false;
    };
  }, [locale, router]);

  const MAX_TOPUP = 1000;
  const topupCandles = Math.max(0, Math.min(MAX_TOPUP, Math.trunc(topupAmount || 0)));

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">{t("profile")}</h1>
        <p className="text-sm text-white/70">{loading ? tp("loading") : tp("subtitle")}</p>

        {me?.user ? (
          <div className="grid gap-3">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-wider text-white/60">
                    {tp("accountTitle")}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{me.user.username}</div>
                  <div className="mt-1 text-sm text-white/70">
                    {me.user.email ? (
                      me.user.email
                    ) : (
                      <span className="text-white/50">{tp("emailNotSet")}</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:w-[220px]">
                  {me.user.isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          curtain.playTo(`/${locale}/admin`);
                        }}
                        className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          curtain.playTo(`/${locale}/admin/users`);
                        }}
                        className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
                      >
                        Manage users
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      curtain.playTo(`/${locale}`);
                    }}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                  >
                    {tp("goHome")}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
                      // `signOut` очищает NextAuth cookie/DB session, чтобы `/api/auth/me` стал `user: null`.
                      await signOut({ redirect: false }).catch(() => null);
                      setMe({ user: null });
                      router.push(`/${locale}`);
                      router.refresh();
                    }}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
                  >
                    {tp("signOutAccount")}
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-wider text-white/60">
                {tp("statsTitle")}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs font-semibold text-white/60">{tp("balanceLabel")}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{me.user.candles}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs font-semibold text-white/60">{tp("donatedLabel")}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {me.user.candlesDonated}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-wider text-white/60">
                {tp("candlesTitle")}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTopupOpen((v) => !v)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                >
                  {tp("topupCta")}
                </button>

                {topupOpen ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-white/70">
                      <div>{tp("topupAmountLabel")}</div>
                      <div className="text-white/55">{tp("topupHint")}</div>
                    </div>

                    <div className="mt-2 flex gap-2" />

                    <div className="mt-3">
                      <input
                        value={String(topupCandles)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          const n = raw ? Number(raw) : 0;
                          const next = Number.isFinite(n) ? Math.min(MAX_TOPUP, n) : 0;
                          setTopupAmount(next);
                        }}
                        inputMode="numeric"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
                        placeholder="10"
                      />
                    </div>

                    <div className="mt-3">
                      <input
                        type="range"
                        min={0}
                        max={MAX_TOPUP}
                        value={topupCandles}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setTopupAmount(Number.isFinite(n) ? n : 0);
                        }}
                        className="w-full accent-white"
                        aria-label={tp("topupAmountLabel")}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                      <div className="text-white/70">{tp("topupPriceLabel")}</div>
                      <div className="inline-flex items-center gap-2 font-semibold text-white">
                        <span className="inline-flex size-6 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-white/10">
                          <Image
                            src="/usdt_icon.webp"
                            alt="USDT"
                            width={24}
                            height={24}
                            className="opacity-95 contrast-125 grayscale"
                          />
                        </span>
                        <span>{topupCandles.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={topupLoading || topupCandles <= 0}
                      onClick={async () => {
                        if (process.env.NODE_ENV === "production") return;
                        setTopupLoading(true);
                        const r = await fetch("/api/candles/topup", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ amount: topupCandles }),
                        }).catch(() => null);
                        setTopupLoading(false);
                        if (!r?.ok) return;
                        const next = (await r.json().catch(() => null)) as {
                          candles?: number;
                        } | null;
                        if (typeof next?.candles !== "number") return;
                        const candles = next.candles;
                        setMe((prev) => {
                          if (!prev?.user) return prev;
                          return { user: { ...prev.user, candles } };
                        });
                      }}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30 disabled:opacity-60"
                    >
                      {process.env.NODE_ENV === "production"
                        ? tp("topupComingSoon")
                        : topupLoading
                          ? "…"
                          : tp("topupPay")}
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
