import { z } from 'zod';
import { uuidSchema, slugSchema } from '@/utils/validators';

export const articleStatusSchema = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
  'REJECTED',
]);

export const articleVisibilitySchema = z.enum([
  'PUBLIC',
  'PRIVATE',
  'SUBSCRIBERS_ONLY',
]);

export const createArticleSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema.optional(),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  content: z.any(), // Editor.js JSON content
  categoryId: uuidSchema,
  featuredImageId: uuidSchema.optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: articleStatusSchema.default('DRAFT'),
  visibility: articleVisibilitySchema.default('PUBLIC'),
  priority: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  stateId: uuidSchema.optional().nullable(),
  districtId: uuidSchema.optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: uuidSchema,
});

export const articleFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: articleStatusSchema.optional(),
  categoryId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  stateId: uuidSchema.optional(),
  districtId: uuidSchema.optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const publishArticleSchema = z.object({
  id: uuidSchema,
});
