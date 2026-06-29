import { z } from 'zod';
import type { Media } from '@prisma/client';
import { updateMediaSchema, mediaFilterSchema } from './schemas';

export interface MediaWithUploader extends Media {
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
}

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type MediaFilters = z.infer<typeof mediaFilterSchema>;
