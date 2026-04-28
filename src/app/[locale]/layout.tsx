import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";

import { defaultLocale, locales, type Locale } from "@/i18n/config";
import enMessages from "../../../messages/en.json";
import ruMessages from "../../../messages/ru.json";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";

const SEO_DESCRIPTION =
  "GitHub Graveyard is a curated graveyard for open‑source repos: discover forgotten GitHub projects, read the signals (commits, issues, PRs, stars), tag their status, and help the worth‑saving ones rise again.";

const SEO_KEYWORDS = [
  "GitHub",
  "Git",
  "open source",
  "repository",
  "repositories",
  "abandoned repo",
  "abandoned repository",
  "inactive repository",
  "unmaintained",
  "maintenance",
  "archive",
  "commit history",
  "issues",
  "pull requests",
  "stars",
  "forks",
  "contributors",
  "software engineering",
  "programming",
  "developer tools",
  "code discovery",
  "project showcase",
].join(", ");

export const metadata: Metadata = {
  title: {
    default: "GitHub Graveyard",
    template: "%s · GitHub Graveyard",
  },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ru: "/ru",
    },
  },
  openGraph: {
    type: "website",
    title: "GitHub Graveyard",
    description: SEO_DESCRIPTION,
    siteName: "GitHub Graveyard",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "GitHub Graveyard" }],
  },
  twitter: {
    card: "summary",
    title: "GitHub Graveyard",
    description: SEO_DESCRIPTION,
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;
  setRequestLocale(activeLocale);
  const messages = activeLocale === "ru" ? ruMessages : enMessages;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GitHub Graveyard",
    url: "/",
    inLanguage: activeLocale,
    description: SEO_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `/${activeLocale}/discover?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <NextIntlClientProvider key={activeLocale} locale={activeLocale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
