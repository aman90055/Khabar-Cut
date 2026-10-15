import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  // Priority 1: DIRECT_URL (session mode pooler, port 5432)
  const directUrl = process.env.DIRECT_URL;
  if (directUrl) return directUrl;

  // Priority 2: DATABASE_URL
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  return url;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

