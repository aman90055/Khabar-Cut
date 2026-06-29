import { z } from 'zod';
import type { Setting } from '@prisma/client';
import { settingSchema, updateSettingSchema } from './schemas';

export interface SettingGroup {
  group: string;
  settings: Setting[];
}

export interface SiteSettings {
  [key: string]: any;
}

export type SettingInput = z.infer<typeof settingSchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
