import { z } from 'zod';
import type { Category } from '@prisma/client';
import { createCategorySchema, updateCategorySchema } from './schemas';

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  _count?: {
    articles: number;
  };
}

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
