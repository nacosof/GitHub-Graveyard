"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { AuthGhost } from "@/features/auth/AuthGhost";
import { AuthEpitaph } from "@/features/auth/AuthEpitaph";
import { type Locale } from "@/i18n/config";
import { useCurtainTransition } from "@/components/CurtainTransition";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0.3c-6.63 0-12 5.37-12 12 0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.28 0 .32.22.7.83.58C20.56 22.1 24 17.6 24 12.3c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12.2 10.3v3.4h5c-.2 1.1-.9 2.8-2.6 3.9-1 .7-2.4 1.2-4.4 1.2-3.3 0-6.1-2.7-6.1-6.1S6.9 6.6 10.2 6.6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C15 4.1 13 3.3 10.2 3.3 4.9 3.3.6 7.6.6 12.8s4.3 9.5 9.6 9.5c5.5 0 9.1-3.9 9.1-9.4 0-.6-.1-1.1-.2-1.6H12.2z"
      />
    </svg>
  );
}

export function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const curtain = useCurtainTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPulse, setSuccessPulse] = useState(0);

  return (
    <form
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessPulse(0);

        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username, password }),
        }).catch(() => null);

        setLoading(false);
        if (!r || !r.ok) {
          const body = await r?.json().catch(() => null);
          if (r?.status === 403 && body?.error === "Email not verified")
            setError(t("errorEmailNotVerified"));
          else setError(t("errorInvalidCredentials"));
          return;
        }

        setSuccessPulse((v) => v + 1);
        curtain.playTo(`/${locale}`);
      }}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.20]">
        <div className="gg-scanlines absolute inset-0" />
      </div>

      <div className="mb-3">
        <AuthGhost eyesClosed={passwordFocused && !showPassword} />
      </div>

      <label className="block text-xs font-semibold text-white/70">{t("username")}</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
        autoComplete="username"
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
          autoComplete="current-password"
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

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-white/70">
        <Link className="hover:text-white" href={`/${locale}/forgot-password`}>
          {t("forgotPassword")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black shadow-sm shadow-black/20 transition-all hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "…" : t("submit")}
      </button>

      <AuthEpitaph
        mood={loading ? "loading" : error ? "error" : successPulse ? "success" : "idle"}
      />

      <div className="mt-5 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        <div className="whitespace-nowrap">{t("oauthDivider")}</div>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() =>
            signIn("github", { callbackUrl: `/api/auth/oauth/bridge?next=/${locale}` })
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/85 hover:border-white/20 hover:bg-black/30"
        >
          <GitHubMark className="size-4 text-white/85" />
          {t("continueWithGitHub")}
        </button>
        <button
          type="button"
          onClick={() =>
            signIn("google", { callbackUrl: `/api/auth/oauth/bridge?next=/${locale}` })
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white/85 hover:border-white/20 hover:bg-black/30"
        >
          <GoogleMark className="size-4 text-white/85" />
          {t("continueWithGoogle")}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-white/70">
        <Link
          className="group relative inline-flex items-center justify-center font-semibold text-white/80 underline decoration-white/20 underline-offset-[6px] transition-all hover:text-white hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          href={`/${locale}/register`}
        >
          <span className="gg-text-shimmer" data-text={t("toSignUp")}>
            <span>{t("toSignUp")}</span>
          </span>
          <span className="pointer-events-none absolute -inset-x-2 -inset-y-1 -z-10 rounded-lg bg-white/0 blur-md transition-all group-hover:bg-white/10" />
        </Link>
      </div>
    </form>
  );
}
