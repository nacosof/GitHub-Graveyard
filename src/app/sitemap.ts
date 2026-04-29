import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const now = new Date();

  const paths = [
    "", // home
    "discover",
    "worlds",
    "login",
    "register",
    "forgot-password",
    "profile",
    "privacy",
    "terms",
    "dmca",
    "security",
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of paths) {
      const url = new URL(`/${locale}${p ? `/${p}` : ""}`, base).toString();
      urls.push({
        url,
        lastModified: now,
        changeFrequency: p === "" ? "daily" : "weekly",
        priority: p === "" ? 1 : 0.6,
      });
    }
  }

  return urls;
}
