import { z } from 'zod';
import type { SeoMetadata } from '@prisma/client';
import { seoMetadataSchema, updateSeoSchema } from './schemas';

export interface SeoData extends SeoMetadata {
  // Can extend if needed
}

export type SeoMetadataInput = z.infer<typeof seoMetadataSchema>;
export type UpdateSeoInput = z.infer<typeof updateSeoSchema>;
