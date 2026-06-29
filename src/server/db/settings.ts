import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getSetting(key: string) {
  return prisma.setting.findFirst({
    where: { key, deletedAt: null },
  });
}

export async function getSettingsByGroup(group: string) {
  return prisma.setting.findMany({
    where: { group, deletedAt: null },
    orderBy: { key: 'asc' },
  });
}

export async function upsertSetting(
  key: string,
  value: Prisma.InputJsonValue,
  group?: string,
  description?: string,
  isPublic?: boolean,
) {
  return prisma.setting.upsert({
    where: { key },
    update: {
      value,
      ...(group !== undefined && { group }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
    },
    create: {
      key,
      value,
      group,
      description,
      isPublic: isPublic ?? false,
    },
  });
}
