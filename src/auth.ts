import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/server/db";

function buildUsernameSeed(data: { email?: string | null; name?: string | null }) {
  const fromEmail = data.email?.split("@")[0]?.trim() ?? "";
  const fromName = data.name?.trim() ?? "";
  const raw = fromEmail || fromName || "user";
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 20) || "user";
}

async function generateUniqueUsername(seed: string) {
  const base = seed || "user";
  let candidate = base;
  let attempt = 0;
  while (attempt < 20) {
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    attempt += 1;
    candidate = `${base.slice(0, 14)}_${Math.random().toString(36).slice(2, 7)}`;
  }
  return `${base.slice(0, 14)}_${Date.now().toString(36).slice(-6)}`;
}

const defaultAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...defaultAdapter,
  async createUser(data) {
    const username = await generateUniqueUsername(buildUsernameSeed(data));
    return prisma.user.create({
      data: {
        username,
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ?? null,
        verified: true,
      },
    });
  },
};

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "database" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;

        const u = username.includes("@")
          ? await prisma.user.findUnique({ where: { email: username } })
          : await prisma.user.findUnique({ where: { username } });

        if (!u) return null;
        if (!u.verified) return null;
        if (!u.passwordHash) return null;

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        return {
          id: u.id,
          name: u.name ?? u.username,
          email: u.email ?? undefined,
          image: u.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) (session.user as any).id = user.id;
      return session;
    },
  },
};
