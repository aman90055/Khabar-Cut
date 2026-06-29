'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { seoMetadataSchema } from './schemas';
import type { SeoMetadataInput } from './types';

export async function upsertSeoMetadata(input: SeoMetadataInput) {
  const user = await requirePermission('seo_metadata', 'update');
  const validated = seoMetadataSchema.parse(input);

  const oldSeo = await prisma.seoMetadata.findUnique({
    where: {
      entityType_entityId: {
        entityType: validated.entityType,
        entityId: validated.entityId,
      },
    },
  });

  const seo = await prisma.seoMetadata.upsert({
    where: {
      entityType_entityId: {
        entityType: validated.entityType,
        entityId: validated.entityId,
      },
    },
    create: {
      entityType: validated.entityType,
      entityId: validated.entityId,
      metaTitle: validated.metaTitle || null,
      metaDescription: validated.metaDescription || null,
      canonicalUrl: validated.canonicalUrl || null,
      ogTitle: validated.ogTitle || null,
      ogDescription: validated.ogDescription || null,
      ogImage: validated.ogImage || null,
      twitterTitle: validated.twitterTitle || null,
      twitterDescription: validated.twitterDescription || null,
      focusKeyword: validated.focusKeyword || null,
      noIndex: validated.noIndex,
      noFollow: validated.noFollow,
    },
    update: {
      metaTitle: validated.metaTitle || null,
      metaDescription: validated.metaDescription || null,
      canonicalUrl: validated.canonicalUrl || null,
      ogTitle: validated.ogTitle || null,
      ogDescription: validated.ogDescription || null,
      ogImage: validated.ogImage || null,
      twitterTitle: validated.twitterTitle || null,
      twitterDescription: validated.twitterDescription || null,
      focusKeyword: validated.focusKeyword || null,
      noIndex: validated.noIndex,
      noFollow: validated.noFollow,
      deletedAt: null, // restore if soft-deleted
    },
  });

  await createAuditLog({
    userId: user.id,
    action: oldSeo ? 'UPDATE_SEO' : 'CREATE_SEO',
    entityType: 'seo_metadata',
    entityId: seo.id,
    oldValues: oldSeo ? JSON.parse(JSON.stringify(oldSeo)) : undefined,
    newValues: JSON.parse(JSON.stringify(seo)),
  });

  revalidateTag(CACHE_TAGS.SEO);

  return { success: true, data: seo };
}

export async function getSeoMetadata(entityType: string, entityId: string) {
  await requirePermission('seo_metadata', 'read');

  const seo = await prisma.seoMetadata.findFirst({
    where: {
      entityType,
      entityId,
      deletedAt: null,
    },
  });

  return { success: true, data: seo };
}

export async function deleteSeoMetadata(entityType: string, entityId: string) {
  const user = await requirePermission('seo_metadata', 'delete');

  const oldSeo = await prisma.seoMetadata.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
  });

  if (!oldSeo) {
    throw new Error('SEO metadata not found');
  }

  const seo = await prisma.seoMetadata.update({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
    data: {
      deletedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_SEO',
    entityType: 'seo_metadata',
    entityId: seo.id,
    oldValues: JSON.parse(JSON.stringify(oldSeo)),
  });

  revalidateTag(CACHE_TAGS.SEO);

  return { success: true };
}
