import { z } from 'zod';
import type { WebStory, Author } from '@prisma/client';
import { createWebStorySchema, updateWebStorySchema, webStoryFilterSchema, webStorySlideSchema } from './schemas';

export type WebStorySlide = z.infer<typeof webStorySlideSchema>;

export interface WebStoryWithAuthor extends WebStory {
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export type CreateWebStoryInput = z.infer<typeof createWebStorySchema>;
export type UpdateWebStoryInput = z.infer<typeof updateWebStorySchema>;
export type WebStoryFilters = z.infer<typeof webStoryFilterSchema>;
