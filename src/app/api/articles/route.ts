import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const rawPageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
  const pageSize = Math.min(100, Math.max(1, rawPageSize));
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const where = {
    status: 'PUBLISHED' as const,
    deletedAt: null,
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [articles, total] = await Promise.all([
    prisma.article
      .findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          author: { select: { fullName: true } },
          featuredImage: { select: { url: true, altText: true } },
        },
        orderBy: { publishedAt: 'desc' },
      })
      .catch(() => []),
    prisma.article.count({ where }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    data: serializeBigInt(articles),
    meta: { total, page, pageSize, totalPages },
  });
}
