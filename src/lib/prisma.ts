import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Automatically rewrite connection string to use project-specific IPv4 pooler on port 6543
  // if Vercel is trying to use direct IPv6 (5432) or misconfigured generic pooler username
  if (
    url.includes('db.wpqpcdqgovgflrpusgkx.supabase.co:5432') ||
    url.includes('postgres.wpqpcdqgovgflrpusgkx')
  ) {
    return "postgresql://postgres:UzhM6jciYu%2FT2%24n@db.wpqpcdqgovgflrpusgkx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1";
  }

  return url;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
