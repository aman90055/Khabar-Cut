'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { createAdSchema, updateAdSchema } from './schemas';
import type { CreateAdInput, UpdateAdInput } from './types';

export async function createAd(input: CreateAdInput) {
  const user = await requirePermission('advertisements', 'create');
  const validated = createAdSchema.parse(input);

  const ad = await prisma.advertisement.create({
    data: {
      title: validated.title,
      type: validated.type,
      content: validated.content || null,
      targetUrl: validated.targetUrl || null,
      imageUrl: validated.imageUrl || null,
      position: validated.position,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_AD',
    entityType: 'advertisement',
    entityId: ad.id,
    newValues: JSON.parse(JSON.stringify(ad)),
  });

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function updateAd(id: string, input: UpdateAdInput) {
  const user = await requirePermission('advertisements', 'update');
  const validated = updateAdSchema.parse({ ...input, id });

  const oldAd = await prisma.advertisement.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldAd) {
    throw new Error('Advertisement not found');
  }

  const ad = await prisma.advertisement.update({
    where: { id },
    data: {
      title: validated.title,
      type: validated.type,
      content: validated.content,
      targetUrl: validated.targetUrl,
      imageUrl: validated.imageUrl,
      position: validated.position,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_AD',
    entityType: 'advertisement',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldAd)),
    newValues: JSON.parse(JSON.stringify(ad)),
  });

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function deleteAd(id: string) {
  const user = await requirePermission('advertisements', 'delete');

  const oldAd = await prisma.advertisement.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldAd) {
    throw new Error('Advertisement not found');
  }

  await prisma.advertisement.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_AD',
    entityType: 'advertisement',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldAd)),
  });

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true };
}

export async function toggleAdActive(id: string) {
  const user = await requirePermission('advertisements', 'update');

  const oldAd = await prisma.advertisement.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldAd) {
    throw new Error('Advertisement not found');
  }

  const ad = await prisma.advertisement.update({
    where: { id },
    data: { isActive: !oldAd.isActive },
  });

  await createAuditLog({
    userId: user.id,
    action: 'TOGGLE_AD',
    entityType: 'advertisement',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldAd)),
    newValues: JSON.parse(JSON.stringify(ad)),
  });

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function recordImpression(id: string) {
  await prisma.advertisement.update({
    where: { id },
    data: {
      impressions: {
        increment: 1,
      },
    },
  });

  return { success: true };
}

export async function recordClick(id: string) {
  await prisma.advertisement.update({
    where: { id },
    data: {
      clicks: {
        increment: 1,
      },
    },
  });

  return { success: true };
}
