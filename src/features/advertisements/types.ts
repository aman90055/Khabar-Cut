import { z } from 'zod';
import type { Advertisement } from '@prisma/client';
import { createAdSchema, updateAdSchema, adFilterSchema } from './schemas';

export interface AdvertisementWithStats extends Advertisement {
  // Can extend if we had separate stat models, otherwise standard model contains views/clicks
}

export type CreateAdInput = z.infer<typeof createAdSchema>;
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
export type AdFilters = z.infer<typeof adFilterSchema>;
