"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { type Locale } from "@/i18n/config";

type UserRow = {
  id: string;
  username: string;
  email: string | null;
  verified: boolean;
  isAdmin: boolean;
  candles: number;
  createdAt: string;
  lastSeenAt: string | null;
};

export default function AdminUsersPage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const ta = useTranslations("Admin");

  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalUser, setModalUser] = useState<UserRow | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [saving, setSaving] = useState(false);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const url = `/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const r = await fetch(url).catch(() => null);
      if (!alive) return;
      setLoading(false);
      if (!r?.ok) {
        router.replace(`/${locale}/profile`);
        return;
      }
      const body = (await r.json().catch(() => null)) as { users?: UserRow[] } | null;
      if (!alive) return;
      setUsers(Array.isArray(body?.users) ? body!.users : []);
    };
    const id = setTimeout(load, 250);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [locale, query, router]);

  const addCandles = async () => {
    if (!modalUser) return;
    const n = Math.max(1, Math.min(1_000_000, Math.trunc(amount || 0)));
    setSaving(true);
    setError(null);
    const r = await fetch("/api/admin/users/candles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: modalUser.id, amount: n }),
    }).catch(() => null);
    setSaving(false);
    if (!r?.ok) {
      setError(ta("failedToAddCandles"));
      return;
    }
    const body = (await r.json().catch(() => null)) as {
      user?: { id: string; candles: number };
    } | null;
    const nextCandles = body?.user?.candles;
    if (typeof nextCandles === "number") {
      setUsers((prev) =>
        prev.map((u) => (u.id === modalUser.id ? { ...u, candles: nextCandles } : u)),
      );
    }
    setModalUser(null);
  };

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{ta("manageUsersTitle")}</h1>
            <p className="mt-1 text-sm text-white/70">{ta("manageUsersSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
            >
              {ta("dashboardTitle")}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20 sm:max-w-md"
              placeholder={ta("searchPlaceholder")}
            />
            <div className="text-xs font-semibold text-white/60">
              {loading ? "Loading…" : `${users.length} users`}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 bg-black/25 px-4 py-3 text-xs font-semibold text-white/60">
              <div className="col-span-3">Username</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Candles</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            <div className="divide-y divide-white/10">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
                  <div className="col-span-3 truncate font-semibold text-white">{u.username}</div>
                  <div className="col-span-3 truncate text-white/70">{u.email ?? "—"}</div>
                  <div className="col-span-2 font-semibold text-white">{u.candles}</div>
                  <div className="col-span-2 text-white/70">
                    {u.isAdmin ? ta("roleAdmin") : ta("roleUser")}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(10);
                        setModalUser(u);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-3 text-xs font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
                    >
                      {ta("addCandles")}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && !loading ? (
                <div className="px-4 py-10 text-center text-sm text-white/60">No users found.</div>
              ) : null}
            </div>
          </div>
        </section>

        {modalUser ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#05060a] p-5 text-white shadow-xl shadow-black/40">
              <div className="text-lg font-semibold">{ta("addCandles")}</div>
              <div className="mt-1 text-sm text-white/70">
                User: <span className="font-semibold text-white">{modalUser.username}</span>
              </div>

              <label className="mt-4 block text-xs font-semibold text-white/70">
                {ta("amount")}
              </label>
              <input
                value={String(amount)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setAmount(raw ? Number(raw) : 0);
                }}
                inputMode="numeric"
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none focus:border-white/20"
                placeholder="10"
              />

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalUser(null)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/90 hover:border-white/20 hover:bg-black/30"
                >
                  {ta("cancel")}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={addCandles}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black shadow-sm shadow-black/20 disabled:opacity-60"
                >
                  {saving ? "…" : ta("add")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
