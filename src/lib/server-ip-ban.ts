import { prisma } from "@/lib/db";

export const MAX_LOGIN_ATTEMPTS = 5;

async function ensureBanTables(): Promise<void> {
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "bannedIp" ("ip" TEXT PRIMARY KEY, "reason" TEXT)`;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "loginAttempt" (
      "ip" TEXT PRIMARY KEY,
      "count" INTEGER NOT NULL DEFAULT 0
    )
  `;
}

export async function isIpBanned(ip: string): Promise<boolean> {
  await ensureBanTables();
  const rows = await prisma.$queryRaw<{ ip: string }[]>`
    SELECT "ip"
    FROM "bannedIp"
    WHERE "ip" = ${ip}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function getBanInfo(ip: string) {
  await ensureBanTables();
  const rows = await prisma.$queryRaw<{ ip: string; reason: string | null }[]>`
    SELECT "ip", "reason"
    FROM "bannedIp"
    WHERE "ip" = ${ip}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getFailedAttempts(ip: string): Promise<number> {
  await ensureBanTables();
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT "count"
    FROM "loginAttempt"
    WHERE "ip" = ${ip}
    LIMIT 1
  `;
  return rows[0]?.count ?? 0;
}

export async function recordFailedAttempt(ip: string): Promise<{
  attempts: number;
  banned: boolean;
}> {
  await ensureBanTables();
  const row = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "loginAttempt" ("ip", "count")
    VALUES (${ip}, 1)
    ON CONFLICT ("ip")
    DO UPDATE SET "count" = "loginAttempt"."count" + 1
    RETURNING "count"
  `;
  const attempts = row[0]?.count ?? 0;

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    await prisma.$executeRaw`
      INSERT INTO "bannedIp" ("ip", "reason")
      VALUES (${ip}, 'Too many failed login attempts')
      ON CONFLICT ("ip") DO UPDATE SET "reason" = EXCLUDED."reason"
    `;
    return { attempts, banned: true };
  }

  return { attempts, banned: false };
}

export async function resetFailedAttempts(ip: string): Promise<void> {
  await ensureBanTables();
  await prisma.$executeRaw`
    DELETE FROM "loginAttempt"
    WHERE "ip" = ${ip}
  `;
}

export async function unbanIp(ip: string): Promise<void> {
  await ensureBanTables();
  await prisma.$executeRaw`
    DELETE FROM "bannedIp"
    WHERE "ip" = ${ip}
  `;
  await resetFailedAttempts(ip);
}
