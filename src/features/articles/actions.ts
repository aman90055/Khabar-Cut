'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { generateSlug, calculateWordCount, calculateReadingTime } from '@/lib/utils';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { 
  createArticleSchema, 
  updateArticleSchema 
} from './schemas';
import type { CreateArticleInput, UpdateArticleInput } from './types';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';

export async function createArticle(input: CreateArticleInput) {
  const user = await requirePermission('articles', 'create');
  const validated = createArticleSchema.parse(input);

  const slug = validated.slug || generateSlug(validated.title);
  const wordCount = calculateWordCount(validated.content);
  const readingTime = calculateReadingTime(wordCount);

  const article = await prisma.article.create({
    data: {
      title: validated.title,
      slug,
      excerpt: validated.excerpt || null,
      content: validated.content || {},
      categoryId: validated.categoryId,
      featuredImageId: validated.featuredImageId || null,
      status: validated.status,
      visibility: validated.visibility,
      priority: validated.priority,
      isFeatured: validated.isFeatured,
      isBreaking: validated.isBreaking,
      stateId: validated.stateId || null,
      districtId: validated.districtId || null,
      scheduledAt: validated.scheduledAt || null,
      wordCount,
      readingTime,
      authorId: user.id,
      ...(validated.tags && {
        tags: {
          create: validated.tags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { slug: generateSlug(tagName) },
                create: { name: tagName, slug: generateSlug(tagName) },
              },
            },
          })),
        },
      }),
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_ARTICLE',
    entityType: 'article',
    entityId: article.id,
    newValues: JSON.parse(JSON.stringify(article)),
  });

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const user = await requirePermission('articles', 'update');
  const validated = updateArticleSchema.parse({ ...input, id });

  const oldArticle = await prisma.article.findUnique({
    where: { id, deletedAt: null },
  });

  if (!oldArticle) {
    throw new Error('Article not found');
  }

  const wordCount = validated.content ? calculateWordCount(validated.content) : (oldArticle.wordCount ?? 0);
  const readingTime = validated.content ? calculateReadingTime(wordCount) : (oldArticle.readingTime ?? 1);
  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldArticle.slug;

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: validated.title,
      slug,
      excerpt: validated.excerpt || null,
      content: validated.content || undefined,
      categoryId: validated.categoryId,
      featuredImageId: validated.featuredImageId || null,
      status: validated.status,
      visibility: validated.visibility,
      priority: validated.priority,
      isFeatured: validated.isFeatured,
      isBreaking: validated.isBreaking,
      stateId: validated.stateId || null,
      districtId: validated.districtId || null,
      scheduledAt: validated.scheduledAt || null,
      wordCount,
      readingTime,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_ARTICLE',
    entityType: 'article',
    entityId: article.id,
    oldValues: JSON.parse(JSON.stringify(oldArticle)),
    newValues: JSON.parse(JSON.stringify(article)),
  });

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function deleteArticle(id: string) {
  const user = await requirePermission('articles', 'delete');

  const article = await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_ARTICLE',
    entityType: 'article',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(article)),
  });

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true };
}

export async function publishArticle(id: string) {
  const user = await requirePermission('articles', 'publish');

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'PUBLISH_ARTICLE',
    entityType: 'article',
    entityId: id,
    newValues: JSON.parse(JSON.stringify(article)),
  });

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function archiveArticle(id: string) {
  const user = await requirePermission('articles', 'publish');

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'ARCHIVE_ARTICLE',
    entityType: 'article',
    entityId: id,
    newValues: JSON.parse(JSON.stringify(article)),
  });

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function incrementViewCount(id: string) {
  await prisma.article.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
  return { success: true };
}
