import { z } from 'zod';
import { uuidSchema, slugSchema } from '@/utils/validators';

export const liveBlogStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'ENDED']);

export const createLiveBlogSchema = z.object({
  title: z.string().min(5).max(200),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  status: liveBlogStatusSchema.default('ACTIVE'),
});

export const updateLiveBlogSchema = createLiveBlogSchema.partial().extend({
  id: uuidSchema,
});

export const createLiveBlogEntrySchema = z.object({
  liveBlogId: uuidSchema,
  content: z.any(), // Editor.js JSON content
  entryType: z.string().default('update'),
  isPinned: z.boolean().default(false),
});

export const liveBlogFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: liveBlogStatusSchema.optional(),
});
