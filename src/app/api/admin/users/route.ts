import { NextResponse } from "next/server";

import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      username: true,
      email: true,
      verified: true,
      isAdmin: true,
      candles: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });

  return NextResponse.json({ users });
}
