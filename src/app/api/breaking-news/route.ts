import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  const breakingNews = await prisma.breakingNews
    .findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { priority: 'desc' },
      take: 10,
      include: {
        article: {
          select: {
            slug: true,
            category: { select: { slug: true } },
          },
        },
      },
    })
    .catch(() => []);

  return NextResponse.json({ data: breakingNews });
}
