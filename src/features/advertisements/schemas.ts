import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const adTypeSchema = z.enum(['BANNER', 'SIDEBAR', 'INLINE', 'POPUP', 'NATIVE']);
export const adPositionSchema = z.enum([
  'HEADER',
  'SIDEBAR',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'ARTICLE_INLINE',
  'FOOTER',
  'POPUP',
]);

export const adBaseSchema = z.object({
  title: z.string().min(3).max(100),
  type: adTypeSchema,
  content: z.string().optional().nullable(),
  targetUrl: z.string().url('Invalid target URL').optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  position: adPositionSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const createAdSchema = adBaseSchema.refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateAdSchema = adBaseSchema.partial().extend({
  id: uuidSchema,
});

export const adFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  position: adPositionSchema.optional(),
});
