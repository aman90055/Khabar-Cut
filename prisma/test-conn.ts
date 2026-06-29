import { PrismaClient } from '@prisma/client';

async function testConnection(url: string, label: string) {
  console.log(`Testing ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Success for ${label}:`, result);
    return true;
  } catch (error: any) {
    console.log(`❌ Failed for ${label}:`, error.message || error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const password = 'UzhM6jciYu/T2$n';
  const encodedPassword = encodeURIComponent(password);
  const tenant = 'postgres.wpqpcdqgovgflrpusgkx';

  const urls = [
    {
      label: 'IPv4 IP + sslservername parameter',
      url: `postgresql://${tenant}:${encodedPassword}@13.237.241.81:6543/postgres?pgbouncer=true&sslmode=verify-full&sslservername=aws-0-ap-southeast-2.pooler.supabase.com`,
    },
    {
      label: 'IPv4 IP + sslrootcert parameter',
      url: `postgresql://${tenant}:${encodedPassword}@13.237.241.81:6543/postgres?pgbouncer=true&sslmode=require`,
    },
  ];

  for (const item of urls) {
    await testConnection(item.url, item.label);
  }
}

main();
