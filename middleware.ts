import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "@/i18n/config";
import { siteSettings } from "./siteSettings";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
});

export default function middleware(req: NextRequest) {
  if (siteSettings.maintenanceMode) {
    const { pathname } = req.nextUrl;
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/maintenance"
    ) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    const res = NextResponse.redirect(url);
    res.headers.set("x-maintenance-mode", "1");
    return res;
  }

  const res = intlMiddleware(req);
  res.headers.set("x-maintenance-mode", "0");
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
