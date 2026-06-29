import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const commentStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']);

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  articleId: uuidSchema,
  parentId: uuidSchema.optional().nullable(),
});

export const moderateCommentSchema = z.object({
  id: uuidSchema,
  status: commentStatusSchema,
});
