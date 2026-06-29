'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import * as settingsDb from '@/server/db/settings';
import { updateSettingSchema, updateSettingsBatchSchema } from './schemas';
import type { UpdateSettingInput } from './types';

export async function getSettingAction(key: string) {
  // Try to read settings. Public settings are allowed for readers, otherwise check settings:read.
  const setting = await settingsDb.getSetting(key);
  
  if (setting && !setting.isPublic) {
    await requirePermission('settings', 'read');
  }

  return { success: true, data: setting };
}

export async function getSettingsByGroupAction(group: string) {
  await requirePermission('settings', 'read');
  const settings = await settingsDb.getSettingsByGroup(group);
  return { success: true, data: settings };
}

export async function updateSettingAction(key: string, input: UpdateSettingInput) {
  const user = await requirePermission('settings', 'update');
  const validated = updateSettingSchema.parse({ ...input, key });

  const oldSetting = await settingsDb.getSetting(key);

  const setting = await settingsDb.upsertSetting(
    validated.key,
    validated.value,
    validated.group || undefined,
    validated.description || undefined,
    validated.isPublic
  );

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_SETTING',
    entityType: 'setting',
    entityId: setting.id,
    oldValues: oldSetting ? JSON.parse(JSON.stringify(oldSetting)) : undefined,
    newValues: JSON.parse(JSON.stringify(setting)),
  });

  revalidateTag(CACHE_TAGS.SETTINGS);
  revalidatePath(CACHE_PATHS.ADMIN_SETTINGS);

  return { success: true, data: setting };
}

export async function updateSettingsBatchAction(items: Array<{ key: string; value: any }>) {
  const user = await requirePermission('settings', 'update');
  const validated = updateSettingsBatchSchema.parse(items);

  const oldSettings = await prisma.setting.findMany({
    where: { key: { in: validated.map(item => item.key) }, deletedAt: null },
  });

  const updates = validated.map((item) =>
    prisma.setting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value, isPublic: false },
    })
  );

  const results = await prisma.$transaction(updates);

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_SETTINGS_BATCH',
    entityType: 'setting',
    entityId: 'batch',
    oldValues: JSON.parse(JSON.stringify(oldSettings)),
    newValues: JSON.parse(JSON.stringify(results)),
  });

  revalidateTag(CACHE_TAGS.SETTINGS);
  revalidatePath(CACHE_PATHS.ADMIN_SETTINGS);

  return { success: true, data: results };
}
