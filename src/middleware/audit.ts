import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface AuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  request?: Request;
}

export async function createAuditLog(params: AuditLogParams) {
  let ipAddress = 'unknown';
  let userAgent = 'unknown';

  if (params.request) {
    ipAddress = params.request.headers.get('x-forwarded-for') || 'unknown';
    userAgent = params.request.headers.get('user-agent') || 'unknown';
  } else {
    try {
      const headerList = await headers();
      ipAddress = headerList.get('x-forwarded-for') || 'unknown';
      userAgent = headerList.get('user-agent') || 'unknown';
    } catch {
      // Fallback if not in a request context
    }
  }

  if (ipAddress.includes(',')) {
    ipAddress = ipAddress.split(',')[0].trim();
  }

  return prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValues: params.oldValues ?? undefined,
      newValues: params.newValues ?? undefined,
      ipAddress,
      userAgent,
      ...(params.userId && {
        user: { connect: { id: params.userId } },
      }),
    },
  });
}
