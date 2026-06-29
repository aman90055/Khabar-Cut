import { z } from 'zod';
import { uuidSchema, slugSchema } from '@/utils/validators';

export const videoStatusSchema = z.enum(['DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED']);

export const createVideoSchema = z.object({
  title: z.string().min(5).max(200),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
  videoUrl: z.string().url('Invalid video URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  categoryId: uuidSchema.optional().nullable(),
  status: videoStatusSchema.default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

export const updateVideoSchema = createVideoSchema.partial().extend({
  id: uuidSchema,
});

export const videoFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: videoStatusSchema.optional(),
  categoryId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  isFeatured: z.boolean().optional(),
});
