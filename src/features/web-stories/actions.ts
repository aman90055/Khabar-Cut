'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { createWebStorySchema, updateWebStorySchema } from './schemas';
import type { CreateWebStoryInput, UpdateWebStoryInput } from './types';

const includeAuthor = {
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} as const;

export async function createWebStory(input: CreateWebStoryInput) {
  const user = await requirePermission('web_stories', 'create');

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
  });

  if (!author) {
    throw new Error('Author profile not found for current user');
  }

  const validated = createWebStorySchema.parse(input);
  const slug = validated.slug || generateSlug(validated.title);

  const story = await prisma.webStory.create({
    data: {
      title: validated.title,
      slug,
      coverImage: validated.coverImage || null,
      slides: validated.slides,
      status: validated.status,
      authorId: author.id,
      publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
    },
    include: includeAuthor,
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_WEB_STORY',
    entityType: 'web_story',
    entityId: story.id,
    newValues: JSON.parse(JSON.stringify(story)),
  });

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}

export async function updateWebStory(id: string, input: UpdateWebStoryInput) {
  const user = await requirePermission('web_stories', 'update');
  const validated = updateWebStorySchema.parse({ ...input, id });

  const oldStory = await prisma.webStory.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldStory) {
    throw new Error('Web story not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldStory.slug;

  const story = await prisma.webStory.update({
    where: { id },
    data: {
      title: validated.title,
      slug,
      coverImage: validated.coverImage,
      slides: validated.slides,
      status: validated.status,
      publishedAt: validated.status === 'PUBLISHED' && oldStory.status !== 'PUBLISHED' ? new Date() : undefined,
    },
    include: includeAuthor,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_WEB_STORY',
    entityType: 'web_story',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldStory)),
    newValues: JSON.parse(JSON.stringify(story)),
  });

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}

export async function deleteWebStory(id: string) {
  const user = await requirePermission('web_stories', 'delete');

  const oldStory = await prisma.webStory.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldStory) {
    throw new Error('Web story not found');
  }

  await prisma.webStory.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_WEB_STORY',
    entityType: 'web_story',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldStory)),
  });

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true };
}

export async function publishWebStory(id: string) {
  const user = await requirePermission('web_stories', 'publish');

  const oldStory = await prisma.webStory.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldStory) {
    throw new Error('Web story not found');
  }

  const story = await prisma.webStory.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    include: includeAuthor,
  });

  await createAuditLog({
    userId: user.id,
    action: 'PUBLISH_WEB_STORY',
    entityType: 'web_story',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldStory)),
    newValues: JSON.parse(JSON.stringify(story)),
  });

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}
