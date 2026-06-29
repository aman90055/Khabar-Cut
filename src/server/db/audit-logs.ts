import { prisma } from '@/lib/prisma';
import { PAGINATION } from '@/lib/constants';
import type { Prisma } from '@prisma/client';

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export interface FindAuditLogsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortOrder?: 'asc' | 'desc';
}

export async function createAuditLog(data: CreateAuditLogData) {
  return prisma.auditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValues: data.oldValues ?? undefined,
      newValues: data.newValues ?? undefined,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      ...(data.userId && {
        user: { connect: { id: data.userId } },
      }),
    },
  });
}

export async function findAuditLogs(params: FindAuditLogsParams = {}) {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    userId,
    entityType,
    entityId,
    action,
    dateFrom,
    dateTo,
    sortOrder = 'desc',
  } = params;

  const where: Prisma.AuditLogWhereInput = {
    deletedAt: null,
    ...(userId && { userId }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(action && { action }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
