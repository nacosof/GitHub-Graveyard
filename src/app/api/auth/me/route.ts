import { NextResponse } from "next/server";

import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ user: null });

  await prisma.user
    .update({
      where: { username: user.username },
      data: { lastSeenAt: new Date() },
      select: { id: true },
    })
    .catch(() => null);

  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { candles: true, id: true, isAdmin: true },
  });
  if (!dbUser) return NextResponse.json({ user: null });

  const donated = await prisma.candleContribution.aggregate({
    where: { userId: dbUser.id },
    _sum: { amountUsd: true },
  });

  return NextResponse.json({
    user: {
      ...user,
      candles: dbUser.candles,
      candlesDonated: donated._sum.amountUsd ?? 0,
      isAdmin: dbUser.isAdmin,
    },
  });
}
