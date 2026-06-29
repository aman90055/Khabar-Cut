import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  const categories = await prisma.category
    .findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })
    .catch(() => []);

  return NextResponse.json({ data: categories });
}
