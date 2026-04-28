const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_GMAIL ? String(process.env.ADMIN_GMAIL).trim() : "";
  const username = process.env.ADMIN_LOGIN ? String(process.env.ADMIN_LOGIN).trim() : "";
  const password = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : "";

  if (!email || !username || !password) return;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, username, isAdmin: true, verified: true },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      isAdmin: true,
      verified: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
