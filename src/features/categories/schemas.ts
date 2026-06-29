import { z } from 'zod';
import { uuidSchema, slugSchema } from '@/utils/validators';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional().nullable(),
  parentId: uuidSchema.optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: uuidSchema,
});

export const reorderCategoriesSchema = z.array(
  z.object({
    id: uuidSchema,
    sortOrder: z.number().int(),
  })
);
