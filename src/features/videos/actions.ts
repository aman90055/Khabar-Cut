'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { createVideoSchema, updateVideoSchema } from './schemas';
import type { CreateVideoInput, UpdateVideoInput } from './types';

const includeRelations = {
  category: true,
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} as const;

export async function createVideo(input: CreateVideoInput) {
  const user = await requirePermission('videos', 'create');

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
  });

  if (!author) {
    throw new Error('Author profile not found for current user');
  }

  const validated = createVideoSchema.parse(input);
  const slug = validated.slug || generateSlug(validated.title);

  const video = await prisma.video.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description,
      videoUrl: validated.videoUrl,
      thumbnailUrl: validated.thumbnailUrl || null,
      duration: validated.duration || null,
      categoryId: validated.categoryId || null,
      status: validated.status,
      isFeatured: validated.isFeatured,
      authorId: author.id,
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_VIDEO',
    entityType: 'video',
    entityId: video.id,
    newValues: JSON.parse(JSON.stringify(video)),
  });

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}

export async function updateVideo(id: string, input: UpdateVideoInput) {
  const user = await requirePermission('videos', 'update');
  const validated = updateVideoSchema.parse({ ...input, id });

  const oldVideo = await prisma.video.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldVideo) {
    throw new Error('Video not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldVideo.slug;

  const video = await prisma.video.update({
    where: { id },
    data: {
      title: validated.title,
      slug,
      description: validated.description,
      videoUrl: validated.videoUrl,
      thumbnailUrl: validated.thumbnailUrl,
      duration: validated.duration,
      categoryId: validated.categoryId,
      status: validated.status,
      isFeatured: validated.isFeatured,
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_VIDEO',
    entityType: 'video',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldVideo)),
    newValues: JSON.parse(JSON.stringify(video)),
  });

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}

export async function deleteVideo(id: string) {
  const user = await requirePermission('videos', 'delete');

  const oldVideo = await prisma.video.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldVideo) {
    throw new Error('Video not found');
  }

  await prisma.video.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_VIDEO',
    entityType: 'video',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldVideo)),
  });

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true };
}

export async function publishVideo(id: string) {
  const user = await requirePermission('videos', 'publish');

  const oldVideo = await prisma.video.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldVideo) {
    throw new Error('Video not found');
  }

  const video = await prisma.video.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'PUBLISH_VIDEO',
    entityType: 'video',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldVideo)),
    newValues: JSON.parse(JSON.stringify(video)),
  });

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}
