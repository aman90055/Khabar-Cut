import { z } from 'zod';
import { uuidSchema, slugSchema } from '@/utils/validators';

export const webStoryStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const webStorySlideSchema = z.object({
  imageUrl: z.string().url('Invalid slide image URL'),
  text: z.string().max(300).optional().nullable(),
  link: z.string().url('Invalid slide link URL').optional().nullable(),
});

export const createWebStorySchema = z.object({
  title: z.string().min(5).max(200),
  slug: slugSchema.optional(),
  coverImage: z.string().url('Invalid cover image URL').optional().nullable(),
  slides: z.array(webStorySlideSchema).min(1, 'A web story must have at least one slide'),
  status: webStoryStatusSchema.default('DRAFT'),
});

export const updateWebStorySchema = createWebStorySchema.partial().extend({
  id: uuidSchema,
});

export const webStoryFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: webStoryStatusSchema.optional(),
  authorId: uuidSchema.optional(),
});
