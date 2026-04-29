import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { prisma } from "@/server/db";
import { authOptions } from "@/auth";

const COOKIE_NAME = "gg_session";

export type SessionUser = {
  username: string;
  email: string | null;
  verified: boolean;
  createdAt: string;
};

export async function getUserFromCookie(): Promise<SessionUser | null> {
  // Priority 1: NextAuth session (prevents stale/incorrect `gg_session` from winning).
  const sessionUser = await getUserFromNextAuthSession();
  if (sessionUser) return sessionUser;

  // Priority 2: legacy custom cookie.
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const u = await prisma.user.findUnique({
    where: { username: raw },
    select: { username: true, email: true, verified: true, createdAt: true },
  });

  if (!u) return null;
  return {
    username: u.username,
    email: u.email ?? null,
    verified: u.verified,
    createdAt: u.createdAt.toISOString(),
  };
}

async function getUserFromNextAuthSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim();
  if (!email) return null;

  const u = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { username: true, email: true, verified: true, createdAt: true },
  });
  if (!u) return null;
  return {
    username: u.username,
    email: u.email ?? null,
    verified: u.verified,
    createdAt: u.createdAt.toISOString(),
  };
}

export function setAuthCookie(username: string) {
  cookies().set(COOKIE_NAME, username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
