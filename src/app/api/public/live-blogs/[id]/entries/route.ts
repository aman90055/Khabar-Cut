import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const entries = await prisma.liveBlogEntry.findMany({
      where: { liveBlogId: id, deletedAt: null },
      include: {
        author: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    return NextResponse.json({ entries: serializeBigInt(entries) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
