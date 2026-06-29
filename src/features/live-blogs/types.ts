import { z } from 'zod';
import type { LiveBlog, LiveBlogEntry } from '@prisma/client';
import { 
  createLiveBlogSchema, 
  updateLiveBlogSchema, 
  createLiveBlogEntrySchema, 
  liveBlogFilterSchema 
} from './schemas';

export interface LiveBlogEntryWithAuthor extends LiveBlogEntry {
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface LiveBlogWithEntries extends LiveBlog {
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  entries: LiveBlogEntryWithAuthor[];
}

export type CreateLiveBlogInput = z.infer<typeof createLiveBlogSchema>;
export type UpdateLiveBlogInput = z.infer<typeof updateLiveBlogSchema>;
export type CreateLiveBlogEntryInput = z.infer<typeof createLiveBlogEntrySchema>;
export type LiveBlogFilters = z.infer<typeof liveBlogFilterSchema>;
