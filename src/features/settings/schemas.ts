import { z } from 'zod';

export const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
  group: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().default(false),
});

export const updateSettingSchema = settingSchema.pick({
  value: true,
  group: true,
  description: true,
  isPublic: true,
}).extend({
  key: z.string().min(1),
});

export const updateSettingsBatchSchema = z.array(
  z.object({
    key: z.string().min(1),
    value: z.any(),
  })
);
