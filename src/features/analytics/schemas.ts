import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const trackEventSchema = z.object({
  articleId: uuidSchema.optional().nullable(),
  pagePath: z.string().min(1),
  eventType: z.string().default('pageview'),
  referrer: z.string().optional().nullable(),
});

export const analyticsFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  articleId: uuidSchema.optional(),
  limit: z.coerce.number().int().positive().default(10),
});
