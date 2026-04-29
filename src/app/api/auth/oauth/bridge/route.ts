import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { setAuthCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim();
  if (!email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { username: true },
  });
  if (!user?.username) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  setAuthCookie(user.username);
  return NextResponse.json({ ok: true });
}
