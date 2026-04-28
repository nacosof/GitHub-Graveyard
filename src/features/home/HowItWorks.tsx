"use client";

import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("Home");

  return (
    <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 md:grid-cols-3">
      <div>
        <div className="font-semibold text-white">{t("steps.scanTitle")}</div>
        <div className="mt-1">{t("steps.scanText")}</div>
      </div>
      <div>
        <div className="font-semibold text-white">{t("steps.tombTitle")}</div>
        <div className="mt-1">{t("steps.tombText")}</div>
      </div>
      <div>
        <div className="font-semibold text-white">{t("steps.notifyTitle")}</div>
        <div className="mt-1">{t("steps.notifyText")}</div>
      </div>
    </section>
  );
}
