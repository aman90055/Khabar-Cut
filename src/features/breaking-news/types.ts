import { z } from 'zod';
import type { BreakingNews, Article } from '@prisma/client';
import { createBreakingNewsSchema, updateBreakingNewsSchema } from './schemas';

export interface BreakingNewsWithArticle extends BreakingNews {
  article: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export type CreateBreakingNewsInput = z.infer<typeof createBreakingNewsSchema>;
export type UpdateBreakingNewsInput = z.infer<typeof updateBreakingNewsSchema>;
