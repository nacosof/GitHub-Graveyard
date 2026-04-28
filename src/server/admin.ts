import { NextResponse } from "next/server";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

export async function requireAdmin() {
  const u = await getUserFromCookie();
  if (!u)
    return {
      ok: false as const,
      res: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };

  const dbUser = await prisma.user.findUnique({
    where: { username: u.username },
    select: { isAdmin: true },
  });
  if (!dbUser?.isAdmin)
    return { ok: false as const, res: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };

  return { ok: true as const, user: u };
}
