import { prisma } from "@/lib/db";

export const MAX_LOGIN_ATTEMPTS = 5;

export async function isIpBanned(ip: string): Promise<boolean> {
  const row = await prisma.bannedIp.findUnique({ where: { ip } });
  return Boolean(row);
}

export async function getBanInfo(ip: string) {
  return prisma.bannedIp.findUnique({ where: { ip } });
}

export async function getFailedAttempts(ip: string): Promise<number> {
  const row = await prisma.loginAttempt.findUnique({ where: { ip } });
  return row?.count ?? 0;
}

export async function recordFailedAttempt(ip: string): Promise<{
  attempts: number;
  banned: boolean;
}> {
  const row = await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, count: 1 },
    update: { count: { increment: 1 } },
  });

  if (row.count >= MAX_LOGIN_ATTEMPTS) {
    await prisma.bannedIp.upsert({
      where: { ip },
      create: {
        ip,
        reason: "Too many failed login attempts",
      },
      update: {},
    });
    return { attempts: row.count, banned: true };
  }

  return { attempts: row.count, banned: false };
}

export async function resetFailedAttempts(ip: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { ip } });
}

export async function unbanIp(ip: string): Promise<void> {
  await prisma.bannedIp.deleteMany({ where: { ip } });
  await resetFailedAttempts(ip);
}
