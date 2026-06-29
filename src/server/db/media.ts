import { prisma } from '@/lib/prisma';
import type { MediaType, Prisma } from '@prisma/client';
import { PAGINATION } from '@/lib/constants';

export interface FindMediaParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: MediaType;
  uploadedById?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const mediaIncludes = {
  uploadedBy: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
    },
  },
} as const;

export async function findMedia(params: FindMediaParams = {}) {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    type,
    uploadedById,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { filename: { contains: search, mode: 'insensitive' as const } },
        { originalName: { contains: search, mode: 'insensitive' as const } },
        { altText: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(type && { type }),
    ...(uploadedById && { uploadedById }),
  };

  const allowedSortFields: Record<string, string> = {
    createdAt: 'createdAt',
    filename: 'filename',
    size: 'size',
  };

  const orderByField = allowedSortFields[sortBy] ?? 'createdAt';

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: mediaIncludes,
      orderBy: { [orderByField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function findMediaById(id: string) {
  return prisma.media.findFirst({
    where: { id, deletedAt: null },
    include: mediaIncludes,
  });
}

export async function createMedia(data: Prisma.MediaCreateInput) {
  return prisma.media.create({
    data,
    include: mediaIncludes,
  });
}

export async function updateMedia(id: string, data: Prisma.MediaUpdateInput) {
  return prisma.media.update({
    where: { id },
    data,
    include: mediaIncludes,
  });
}

export async function softDeleteMedia(id: string) {
  return prisma.media.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
