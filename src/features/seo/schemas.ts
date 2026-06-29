import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const seoMetadataSchema = z.object({
  entityType: z.string().min(1),
  entityId: uuidSchema,
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  canonicalUrl: z.string().url('Invalid canonical URL').optional().nullable().or(z.literal('')),
  ogTitle: z.string().max(100).optional().nullable(),
  ogDescription: z.string().max(200).optional().nullable(),
  ogImage: z.string().url('Invalid OG image URL').optional().nullable().or(z.literal('')),
  twitterTitle: z.string().max(100).optional().nullable(),
  twitterDescription: z.string().max(200).optional().nullable(),
  focusKeyword: z.string().max(100).optional().nullable(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

export const updateSeoSchema = seoMetadataSchema.partial().extend({
  entityType: z.string(),
  entityId: uuidSchema,
});
