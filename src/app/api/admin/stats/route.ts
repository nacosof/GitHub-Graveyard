import { NextResponse } from "next/server";

import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const [registeredUsers, onlineUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
    }),
  ]);

  return NextResponse.json({ registeredUsers, onlineUsers, onlineWindowMinutes: 5 });
}
