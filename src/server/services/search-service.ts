import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class SearchService {
  public static async searchArticles(query: string, filters: { page?: number; pageSize?: number } = {}) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
          featuredImage: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  public static async searchAll(query: string) {
    const [articles, categories, tags] = await Promise.all([
      prisma.article.findMany({
        where: {
          deletedAt: null,
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      }),

      prisma.category.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),

      prisma.tag.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    return {
      articles,
      categories,
      tags,
    };
  }
}
