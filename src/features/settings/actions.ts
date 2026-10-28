'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateSettingSchema, updateSettingsBatchSchema } from './schemas';
import type { UpdateSettingInput } from './types';

export async function getSettingAction(key: string) {
  const supabase = createAdminClient();

  const { data: setting } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .is('deleted_at', null)
    .maybeSingle();

  return { success: true, data: setting };
}

export async function getSettingsByGroupAction(group: string) {
  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('group', group)
    .is('deleted_at', null)
    .order('key', { ascending: true });

  return { success: true, data: settings || [] };
}

export async function updateSettingAction(key: string, input: UpdateSettingInput) {
  const validated = updateSettingSchema.parse({ ...input, key });
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  let setting;
  if (existing) {
    const { data, error } = await supabase
      .from('settings')
      .update({
        value: validated.value,
        group: validated.group || undefined,
        description: validated.description || undefined,
        is_public: validated.isPublic ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    setting = data;
  } else {
    const { data, error } = await supabase
      .from('settings')
      .insert({
        key,
        value: validated.value,
        group: validated.group || 'general',
        description: validated.description || null,
        is_public: validated.isPublic ?? false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    setting = data;
  }

  revalidateTag(CACHE_TAGS.SETTINGS);
  revalidatePath(CACHE_PATHS.ADMIN_SETTINGS);

  return { success: true, data: setting };
}

export async function updateSettingsBatchAction(items: Array<{ key: string; value: any }>) {
  const validated = updateSettingsBatchSchema.parse(items);
  const supabase = createAdminClient();

  const results = [];
  for (const item of validated) {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', item.key)
      .maybeSingle();

    if (existing) {
      const { data } = await supabase
        .from('settings')
        .update({
          value: item.value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      results.push(data);
    } else {
      const { data } = await supabase
        .from('settings')
        .insert({
          key: item.key,
          value: item.value,
          group: 'general',
          is_public: false,
        })
        .select('*')
        .single();
      results.push(data);
    }
  }

  revalidateTag(CACHE_TAGS.SETTINGS);
  revalidatePath(CACHE_PATHS.ADMIN_SETTINGS);

  return { success: true, data: results };
}
