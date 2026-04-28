"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

import { AuthGhost } from "@/features/auth/AuthGhost";
import { AuthEpitaph } from "@/features/auth/AuthEpitaph";
import { type Locale } from "@/i18n/config";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const locale = useLocale() as Locale;

  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPulse, setSuccessPulse] = useState(0);

  const cleanedEmail = useMemo(() => email.trim(), [email]);

  const passwordOk = (v: string) =>
    v.length >= 8 && (v.match(/[a-z]/g) ?? []).length >= 1 && (v.match(/[A-Z]/g) ?? []).length >= 2;

  const humanize = (body: any) => {
    if (body?.errorCode === "INVALID_CODE") return t("errorInvalidCode");
    if (body?.errorCode === "CODE_EXPIRED") return t("errorCodeExpired");
    if (body?.errorCode === "NO_PENDING") return t("errorResetNoPending");
    if (body?.errorCode === "NO_ACCOUNT") return t("errorNoAccount");
    if (body?.issue?.path === "email") return t("errorEmailInvalid");
    if (
      body?.issue?.path === "newPassword" &&
      (body?.issue?.code === "too_small" || body?.issue?.code === "custom")
    ) {
      return t("errorPasswordPolicy");
    }
    return t("errorInvalidBody");
  };

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">{t("resetTitle")}</h1>

        <form
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccessPulse(0);

            if (step === "request") {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail) || cleanedEmail.length > 320) {
                setError(t("errorEmailInvalid"));
                return;
              }
              setLoading(true);
              const res = await fetch("/api/auth/password/reset-request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: cleanedEmail }),
              });
              const body = await res.json().catch(() => null);
              setLoading(false);
              if (!res.ok) {
                setError(humanize(body));
                return;
              }
              if (body?.devCode) setCode(String(body.devCode));
              setStep("verify");
              return;
            }

            if (step === "verify") {
              if (!passwordOk(newPassword)) {
                setError(t("errorPasswordPolicy"));
                return;
              }
              setLoading(true);
              const res = await fetch("/api/auth/password/reset-verify", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: cleanedEmail, code: code.trim(), newPassword }),
              });
              const body = await res.json().catch(() => null);
              setLoading(false);
              if (!res.ok) {
                setError(humanize(body));
                return;
              }
              setStep("done");
              setSuccessPulse((v) => v + 1);
            }
          }}
        >
          <div className="absolute inset-0 -z-10 opacity-[0.20]">
            <div className="gg-scanlines absolute inset-0" />
          </div>

          <div className="mb-3">
            <AuthGhost eyesClosed={newPasswordFocused && !showNewPassword} />
          </div>

          {step === "request" ? (
            <>
              <label className="block text-xs font-semibold text-white/70">{t("email")}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none focus:border-white/20"
                autoComplete="email"
                inputMode="email"
              />
            </>
          ) : step === "verify" ? (
            <>
              <label className="block text-xs font-semibold text-white/70">{t("code")}</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none focus:border-white/20"
                inputMode="numeric"
                autoComplete="one-time-code"
              />

              <label className="mt-4 block text-xs font-semibold text-white/70">
                {t("resetNewPassword")}
              </label>
              <div className="relative mt-2">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? "text" : "password"}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/50 pl-3 pr-11 text-sm text-white outline-none focus:border-white/20"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-1 top-1 inline-flex size-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white"
                  aria-label={t("showPassword")}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {t("resetDone")}
            </div>
          )}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {step !== "done" ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black shadow-sm shadow-black/20 hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 disabled:opacity-60"
              >
                {loading ? "…" : step === "request" ? t("resetSend") : t("verify")}
              </button>
              <AuthEpitaph
                mood={loading ? "loading" : error ? "error" : successPulse ? "success" : "idle"}
              />
            </>
          ) : (
            <Link
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black"
              href={`/${locale}/login`}
            >
              {t("signIn")}
            </Link>
          )}
        </form>
      </div>
    </main>
  );
}
