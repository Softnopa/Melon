const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
process.env.DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;

(async () => {
  const prisma = new PrismaClient({ log: [] });
  const resultPath = path.resolve(process.cwd(), '.tmp-ban-inspect.json');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('bannedIp', 'loginAttempt')
      ORDER BY table_name
    `;

    const banned = tables.length
      ? await prisma.$queryRaw`
          SELECT * FROM "bannedIp"
        `
      : [];

    const attempts = tables.length
      ? await prisma.$queryRaw`
          SELECT * FROM "loginAttempt"
        `
      : [];

    fs.writeFileSync(resultPath, JSON.stringify({ tables, banned, attempts }, null, 2));
  } catch (error) {
    fs.writeFileSync(resultPath, JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
})();
