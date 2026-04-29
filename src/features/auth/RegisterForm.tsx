"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AuthGhost } from "@/features/auth/AuthGhost";
import { AuthEpitaph } from "@/features/auth/AuthEpitaph";
import { type Locale } from "@/i18n/config";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const locale = useLocale() as Locale;

  const [step, setStep] = useState<"form" | "verify">("form");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPulse, setSuccessPulse] = useState(0);

  const cleanedUsername = useMemo(() => username.trim(), [username]);
  const cleanedEmail = useMemo(() => email.trim(), [email]);

  const usernameOk = (v: string) => /^[a-zA-Z0-9_]{3,24}$/.test(v);
  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 320;

  const passwordOk = (v: string) =>
    v.length >= 8 && (v.match(/[a-z]/g) ?? []).length >= 1 && (v.match(/[A-Z]/g) ?? []).length >= 2;

  const humanizeRegisterError = (body: any) => {
    if (body?.errorCode === "USERNAME_TAKEN") return t("errorUsernameTaken");
    if (body?.errorCode === "EMAIL_TAKEN") return t("errorEmailTaken");

    const issue = body?.issue;
    if (issue?.path === "password" && (issue?.code === "too_small" || issue?.code === "custom")) {
      return t("errorPasswordPolicy");
    }
    if (issue?.path === "username") return t("errorUsernameInvalid");
    if (issue?.path === "email") return t("errorEmailInvalid");

    return t("errorInvalidBody");
  };

  const humanizeVerifyError = (body: any) => {
    if (body?.errorCode === "INVALID_CODE") return t("errorInvalidCode");
    if (body?.errorCode === "CODE_EXPIRED") return t("errorCodeExpired");
    if (body?.errorCode === "NO_PENDING") return t("errorNoPending");
    if (body?.errorCode === "USERNAME_TAKEN") return t("errorUsernameTaken");
    if (body?.errorCode === "EMAIL_TAKEN") return t("errorEmailTaken");
    return t("errorInvalidBody");
  };

  return (
    <form
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessPulse(0);

        if (step === "form") {
          if (!acceptedLegal) {
            setError(
              locale === "ru"
                ? "Прими Terms of Service и Privacy Policy, чтобы продолжить."
                : "Please accept Terms of Service and Privacy Policy to continue."
            );
            return;
          }

          if (!usernameOk(cleanedUsername)) {
            setError(t("errorUsernameInvalid"));
            return;
          }
          if (!emailOk(cleanedEmail)) {
            setError(t("errorEmailInvalid"));
            return;
          }
          if (!passwordOk(password)) {
            setError(t("errorPasswordPolicy"));
            return;
          }
          if (password !== confirmPassword) {
            setError(t("errorPasswordsDontMatch"));
            return;
          }

          setLoading(true);
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: cleanedUsername, email: cleanedEmail, password }),
          });
          const body = await res.json().catch(() => null);
          setLoading(false);
          if (!res.ok) {
            setError(humanizeRegisterError(body));
            return;
          }

          if (body?.devCode) setCode(String(body.devCode));
          setStep("verify");
          return;
        }

        setLoading(true);
        const res = await fetch("/api/auth/register/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: cleanedEmail, code: code.trim() }),
        });
        const body = await res.json().catch(() => null);
        setLoading(false);
        if (!res.ok) {
          setError(humanizeVerifyError(body));
          return;
        }

        setSuccessPulse((v) => v + 1);
        router.push(`/${locale}`);
        router.refresh();
      }}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.20]">
        <div className="gg-scanlines absolute inset-0" />
      </div>

      <div className="mb-3">
        <AuthGhost
          eyesClosed={
            (passwordFocused && !showPassword) || (confirmPasswordFocused && !showConfirmPassword)
          }
        />
      </div>

      {step === "form" ? (
        <>
          <label className="block text-xs font-semibold text-white/70">{t("username")}</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
            autoComplete="username"
          />

          <label className="mt-4 block text-xs font-semibold text-white/70">{t("email")}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
            autoComplete="email"
            inputMode="email"
          />

          <label className="mt-4 block text-xs font-semibold text-white/70">{t("password")}</label>
          <div className="relative mt-2">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/50 pl-3 pr-11 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1 top-1 inline-flex size-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white"
              aria-label={t("showPassword")}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <label className="mt-4 block text-xs font-semibold text-white/70">
            {t("confirmPassword")}
          </label>
          <div className="relative mt-2">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/50 pl-3 pr-11 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-1 top-1 inline-flex size-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white"
              aria-label={t("showPassword")}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => setAcceptedLegal(e.target.checked)}
              className="mt-1 size-4 accent-white"
              aria-label="Accept Terms and Privacy"
            />
            <p className="text-xs leading-4 text-white/60">
              {locale === "ru" ? "Я согласен с " : "I agree to "}
              <Link className="underline underline-offset-4 hover:text-white" href={`/${locale}/terms`}>
                Terms of Service
              </Link>{" "}
              {locale === "ru" ? "и " : "and "}
              <Link
                className="underline underline-offset-4 hover:text-white"
                href={`/${locale}/privacy`}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/75">
            <div className="font-semibold text-white/85">
              {t("codeSent", { email: cleanedEmail })}
            </div>
            <div className="mt-1">{t("enterCode")}</div>
          </div>

          <label className="mt-4 block text-xs font-semibold text-white/70">{t("code")}</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </>
      )}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || (step === "form" && !acceptedLegal)}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black shadow-sm shadow-black/20 hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 disabled:opacity-60"
      >
        {loading ? "…" : step === "form" ? t("submitSignUp") : t("verify")}
      </button>

      <AuthEpitaph
        mood={loading ? "loading" : error ? "error" : successPulse ? "success" : "idle"}
      />

      <div className="mt-4 text-center text-xs text-white/70">
        <Link
          className="group relative inline-flex items-center justify-center font-semibold text-white/80 underline decoration-white/20 underline-offset-[6px] transition-all hover:text-white hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          href={`/${locale}/login`}
        >
          <span className="gg-text-shimmer" data-text={t("toSignIn")}>
            <span>{t("toSignIn")}</span>
          </span>
          <span className="pointer-events-none absolute -inset-x-2 -inset-y-1 -z-10 rounded-lg bg-white/0 blur-md transition-all group-hover:bg-white/10" />
        </Link>
      </div>
    </form>
  );
}
