import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  const dbResult = await prisma.$queryRaw`SELECT 1`.catch(() => null);
  const isDatabaseConnected = dbResult !== null;

  return NextResponse.json({
    status: isDatabaseConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: isDatabaseConnected ? 'connected' : 'disconnected',
    },
  });
}
