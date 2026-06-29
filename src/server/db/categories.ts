import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PAGINATION } from '@/lib/constants';

export interface FindCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const categoryIncludes = {
  children: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  _count: {
    select: {
      articles: {
        where: { deletedAt: null },
      },
    },
  },
} as const;

export async function findCategories(params: FindCategoriesParams = {}) {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    parentId,
    isActive,
    sortBy = 'sortOrder',
    sortOrder = 'asc',
  } = params;

  const where: Prisma.CategoryWhereInput = {
    deletedAt: null,
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
    ...(parentId !== undefined && { parentId }),
    ...(isActive !== undefined && { isActive }),
  };

  const allowedSortFields: Record<string, string> = {
    sortOrder: 'sortOrder',
    name: 'name',
    createdAt: 'createdAt',
  };

  const orderByField = allowedSortFields[sortBy] ?? 'sortOrder';

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: categoryIncludes,
      orderBy: { [orderByField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, deletedAt: null },
    include: categoryIncludes,
  });
}

export async function findCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, deletedAt: null },
    include: categoryIncludes,
  });
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({
    data,
    include: categoryIncludes,
  });
}

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput,
) {
  return prisma.category.update({
    where: { id },
    data,
    include: categoryIncludes,
  });
}

export async function softDeleteCategory(id: string) {
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null, parentId: null },
    include: {
      children: {
        where: { deletedAt: null },
        include: {
          children: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              articles: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          articles: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return categories;
}

export async function checkCategorySlugExists(
  slug: string,
  excludeId?: string,
) {
  const existing = await prisma.category.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });
  return !!existing;
}

export async function reorderCategories(
  items: Array<{ id: string; sortOrder: number }>,
) {
  const updates = items.map((item) =>
    prisma.category.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    }),
  );

  return prisma.$transaction(updates);
}
