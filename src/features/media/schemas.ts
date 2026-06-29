import { z } from 'zod';
import { uuidSchema } from '@/utils/validators';

export const updateMediaSchema = z.object({
  altText: z.string().max(200).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
});

export const mediaFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO']).optional(),
});
