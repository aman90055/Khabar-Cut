'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { createBreakingNewsSchema, updateBreakingNewsSchema } from './schemas';
import type { CreateBreakingNewsInput, UpdateBreakingNewsInput } from './types';

const includeArticle = {
  article: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
} as const;

export async function createBreakingNews(input: CreateBreakingNewsInput) {
  const user = await requirePermission('breaking_news', 'create');
  const validated = createBreakingNewsSchema.parse(input);

  const breaking = await prisma.breakingNews.create({
    data: {
      title: validated.title,
      articleId: validated.articleId || null,
      isActive: validated.isActive,
      priority: validated.priority,
      expiresAt: validated.expiresAt || null,
    },
    include: includeArticle,
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: breaking.id,
    newValues: JSON.parse(JSON.stringify(breaking)),
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}

export async function updateBreakingNews(id: string, input: UpdateBreakingNewsInput) {
  const user = await requirePermission('breaking_news', 'update');
  const validated = updateBreakingNewsSchema.parse({ ...input, id });

  const oldBreaking = await prisma.breakingNews.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  const breaking = await prisma.breakingNews.update({
    where: { id },
    data: {
      title: validated.title,
      articleId: validated.articleId,
      isActive: validated.isActive,
      priority: validated.priority,
      expiresAt: validated.expiresAt,
    },
    include: includeArticle,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldBreaking)),
    newValues: JSON.parse(JSON.stringify(breaking)),
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}

export async function deleteBreakingNews(id: string) {
  const user = await requirePermission('breaking_news', 'delete');

  const oldBreaking = await prisma.breakingNews.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  await prisma.breakingNews.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldBreaking)),
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true };
}

export async function toggleBreakingNewsActive(id: string) {
  const user = await requirePermission('breaking_news', 'update');

  const oldBreaking = await prisma.breakingNews.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  const breaking = await prisma.breakingNews.update({
    where: { id },
    data: { isActive: !oldBreaking.isActive },
    include: includeArticle,
  });

  await createAuditLog({
    userId: user.id,
    action: 'TOGGLE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldBreaking)),
    newValues: JSON.parse(JSON.stringify(breaking)),
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}
