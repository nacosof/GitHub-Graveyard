import { cookies } from "next/headers";

import { prisma } from "@/server/db";

const COOKIE_NAME = "gg_session";

export type SessionUser = {
  username: string;
  email: string | null;
  verified: boolean;
  createdAt: string;
};

export async function getUserFromCookie(): Promise<SessionUser | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const u = await prisma.user.findUnique({
    where: { username: raw },
    select: { username: true, email: true, verified: true, createdAt: true },
  });
  if (u)
    return {
      username: u.username,
      email: u.email ?? null,
      verified: u.verified,
      createdAt: u.createdAt.toISOString(),
    };
  return null;
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
