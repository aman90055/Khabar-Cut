import { prisma } from '@/lib/prisma';
import type { Prisma, ArticleStatus, ArticleVisibility } from '@prisma/client';
import { PAGINATION } from '@/lib/constants';

export interface FindArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ArticleStatus;
  categoryId?: string;
  authorId?: string;
  stateId?: string;
  districtId?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  visibility?: ArticleVisibility;
}

const articleIncludes = {
  category: true,
  author: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      email: true,
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  tags: {
    where: { deletedAt: null },
    include: {
      tag: true,
    },
  },
  featuredImage: true,
  seoMetadata: true,
  _count: {
    select: {
      comments: {
        where: { deletedAt: null, status: 'APPROVED' as const },
      },
    },
  },
} as const;

const articleListIncludes = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
    },
  },
  author: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
    },
  },
  featuredImage: {
    select: {
      id: true,
      url: true,
      altText: true,
      thumbnailUrl: true,
    },
  },
  _count: {
    select: {
      comments: {
        where: { deletedAt: null, status: 'APPROVED' as const },
      },
    },
  },
} as const;

export async function findArticles(params: FindArticlesParams = {}) {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    status,
    categoryId,
    authorId,
    stateId,
    districtId,
    isFeatured,
    isBreaking,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    visibility,
  } = params;

  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && { status }),
    ...(categoryId && { categoryId }),
    ...(authorId && { authorId }),
    ...(stateId && { stateId }),
    ...(districtId && { districtId }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isBreaking !== undefined && { isBreaking }),
    ...(visibility && { visibility }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
  };

  const allowedSortFields: Record<string, string> = {
    createdAt: 'createdAt',
    publishedAt: 'publishedAt',
    title: 'title',
    viewCount: 'viewCount',
    priority: 'priority',
  };

  const orderByField = allowedSortFields[sortBy] ?? 'createdAt';

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleListIncludes,
      orderBy: { [orderByField]: sortOrder },
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

export async function findArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, deletedAt: null },
    include: articleIncludes,
  });
}

export async function findArticleById(id: string) {
  return prisma.article.findFirst({
    where: { id, deletedAt: null },
    include: articleIncludes,
  });
}

export async function createArticle(
  data: Prisma.ArticleCreateInput,
) {
  return prisma.article.create({
    data,
    include: articleIncludes,
  });
}

export async function updateArticle(
  id: string,
  data: Prisma.ArticleUpdateInput,
) {
  return prisma.article.update({
    where: { id },
    data,
    include: articleIncludes,
  });
}

export async function softDeleteArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function publishArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    include: articleIncludes,
  });
}

export async function archiveArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: { status: 'ARCHIVED' },
    include: articleIncludes,
  });
}

export async function incrementViews(id: string) {
  return prisma.article.update({
    where: { id },
    data: {
      viewCount: { increment: 1 },
    },
  });
}

export async function checkSlugExists(slug: string, excludeId?: string) {
  const existing = await prisma.article.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });
  return !!existing;
}
