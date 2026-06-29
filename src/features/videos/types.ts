import { z } from 'zod';
import type { Video, Category } from '@prisma/client';
import { createVideoSchema, updateVideoSchema, videoFilterSchema } from './schemas';

export interface VideoWithRelations extends Video {
  category: Category | null;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type VideoFilters = z.infer<typeof videoFilterSchema>;
