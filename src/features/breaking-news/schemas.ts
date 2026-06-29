import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const createBreakingNewsSchema = z.object({
  title: z.string().min(5).max(300),
  articleId: uuidSchema.optional().nullable(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const updateBreakingNewsSchema = createBreakingNewsSchema.partial().extend({
  id: uuidSchema,
});
