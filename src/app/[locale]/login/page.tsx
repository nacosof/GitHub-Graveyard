"use client";

import { useTranslations } from "next-intl";

import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  const t = useTranslations("Auth");

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">{t("signIn")}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
