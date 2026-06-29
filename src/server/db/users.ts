import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PAGINATION } from '@/lib/constants';

export interface FindUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const userIncludes = {
  role: {
    select: {
      id: true,
      name: true,
      slug: true,
      level: true,
    },
  },
} as const;

export async function findUsers(params: FindUsersParams = {}) {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    roleId,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(roleId && { roleId }),
    ...(isActive !== undefined && { isActive }),
  };

  const allowedSortFields: Record<string, string> = {
    createdAt: 'createdAt',
    fullName: 'fullName',
    email: 'email',
    lastLoginAt: 'lastLoginAt',
  };

  const orderByField = allowedSortFields[sortBy] ?? 'createdAt';

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: userIncludes,
      orderBy: { [orderByField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: userIncludes,
  });
}

export async function findUserByAuthId(authId: string) {
  return prisma.user.findFirst({
    where: { authId, deletedAt: null },
    include: userIncludes,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: userIncludes,
  });
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
    include: userIncludes,
  });
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data,
    include: userIncludes,
  });
}

export async function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function upsertUserFromAuth(authData: {
  authId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  authProvider: string;
}) {
  const defaultRole = await prisma.role.findFirst({
    where: { slug: 'reader', deletedAt: null },
  });

  if (!defaultRole) {
    throw new Error('Default reader role not found');
  }

  return prisma.user.upsert({
    where: { authId: authData.authId },
    update: {
      email: authData.email,
      fullName: authData.fullName,
      avatarUrl: authData.avatarUrl,
      lastLoginAt: new Date(),
    },
    create: {
      authId: authData.authId,
      email: authData.email,
      fullName: authData.fullName,
      avatarUrl: authData.avatarUrl,
      authProvider: authData.authProvider,
      role: { connect: { id: defaultRole.id } },
      isVerified: true,
      lastLoginAt: new Date(),
    },
    include: userIncludes,
  });
}
