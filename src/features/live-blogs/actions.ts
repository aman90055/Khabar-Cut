'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { 
  createLiveBlogSchema, 
  updateLiveBlogSchema, 
  createLiveBlogEntrySchema 
} from './schemas';
import type { 
  CreateLiveBlogInput, 
  UpdateLiveBlogInput, 
  CreateLiveBlogEntryInput 
} from './types';

const includeRelations = {
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  entries: {
    where: { deletedAt: null },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

export async function createLiveBlog(input: CreateLiveBlogInput) {
  const user = await requirePermission('live_blogs', 'create');

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
  });

  if (!author) {
    throw new Error('Author profile not found for current user');
  }

  const validated = createLiveBlogSchema.parse(input);
  const slug = validated.slug || generateSlug(validated.title);

  const liveBlog = await prisma.liveBlog.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description,
      status: validated.status,
      authorId: author.id,
      startedAt: new Date(),
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_LIVE_BLOG',
    entityType: 'live_blog',
    entityId: liveBlog.id,
    newValues: JSON.parse(JSON.stringify(liveBlog)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function updateLiveBlog(id: string, input: UpdateLiveBlogInput) {
  const user = await requirePermission('live_blogs', 'update');
  const validated = updateLiveBlogSchema.parse({ ...input, id });

  const oldBlog = await prisma.liveBlog.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldBlog) {
    throw new Error('Live blog not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldBlog.slug;

  const liveBlog = await prisma.liveBlog.update({
    where: { id },
    data: {
      title: validated.title,
      slug,
      description: validated.description,
      status: validated.status,
      endedAt: validated.status === 'ENDED' && oldBlog.status !== 'ENDED' ? new Date() : undefined,
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_LIVE_BLOG',
    entityType: 'live_blog',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldBlog)),
    newValues: JSON.parse(JSON.stringify(liveBlog)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function endLiveBlog(id: string) {
  const user = await requirePermission('live_blogs', 'update');

  const oldBlog = await prisma.liveBlog.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldBlog) {
    throw new Error('Live blog not found');
  }

  const liveBlog = await prisma.liveBlog.update({
    where: { id },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
    },
    include: includeRelations,
  });

  await createAuditLog({
    userId: user.id,
    action: 'END_LIVE_BLOG',
    entityType: 'live_blog',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldBlog)),
    newValues: JSON.parse(JSON.stringify(liveBlog)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function addEntry(input: CreateLiveBlogEntryInput) {
  const user = await requirePermission('live_blogs', 'create');
  const validated = createLiveBlogEntrySchema.parse(input);

  const author = await prisma.author.findUnique({
    where: { userId: user.id },
  });

  if (!author) {
    throw new Error('Author profile not found for current user');
  }

  const entry = await prisma.liveBlogEntry.create({
    data: {
      liveBlogId: validated.liveBlogId,
      content: validated.content,
      entryType: validated.entryType,
      isPinned: validated.isPinned,
      authorId: author.id,
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'ADD_LIVE_BLOG_ENTRY',
    entityType: 'live_blog_entry',
    entityId: entry.id,
    newValues: JSON.parse(JSON.stringify(entry)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: entry };
}

export async function pinEntry(id: string, isPinned: boolean) {
  const user = await requirePermission('live_blogs', 'update');

  const oldEntry = await prisma.liveBlogEntry.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldEntry) {
    throw new Error('Live blog entry not found');
  }

  // Unpin all other entries in this live blog if this one is pinned
  if (isPinned) {
    await prisma.liveBlogEntry.updateMany({
      where: { liveBlogId: oldEntry.liveBlogId, isPinned: true },
      data: { isPinned: false },
    });
  }

  const entry = await prisma.liveBlogEntry.update({
    where: { id },
    data: { isPinned },
  });

  await createAuditLog({
    userId: user.id,
    action: 'PIN_LIVE_BLOG_ENTRY',
    entityType: 'live_blog_entry',
    entityId: id,
    newValues: JSON.parse(JSON.stringify(entry)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: entry };
}

export async function deleteEntry(id: string) {
  const user = await requirePermission('live_blogs', 'delete');

  const oldEntry = await prisma.liveBlogEntry.findFirst({
    where: { id, deletedAt: null },
  });

  if (!oldEntry) {
    throw new Error('Live blog entry not found');
  }

  await prisma.liveBlogEntry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_LIVE_BLOG_ENTRY',
    entityType: 'live_blog_entry',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldEntry)),
  });

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true };
}
