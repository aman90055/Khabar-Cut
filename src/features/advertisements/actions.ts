'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAdSchema, updateAdSchema } from './schemas';
import type { CreateAdInput, UpdateAdInput } from './types';

export async function createAd(input: CreateAdInput) {
  const validated = createAdSchema.parse(input);
  const supabase = createAdminClient();

  const { data: ad, error } = await supabase
    .from('advertisements')
    .insert({
      title: validated.title,
      type: validated.type,
      content: validated.content || null,
      target_url: validated.targetUrl || null,
      image_url: validated.imageUrl || null,
      position: validated.position,
      start_date: validated.startDate,
      end_date: validated.endDate,
      is_active: validated.isActive,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create advertisement: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function updateAd(id: string, input: UpdateAdInput) {
  const validated = updateAdSchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldAd, error: fetchErr } = await supabase
    .from('advertisements')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldAd) {
    throw new Error('Advertisement not found');
  }

  const { data: ad, error: updateErr } = await supabase
    .from('advertisements')
    .update({
      title: validated.title,
      type: validated.type,
      content: validated.content,
      target_url: validated.targetUrl,
      image_url: validated.imageUrl,
      position: validated.position,
      start_date: validated.startDate,
      end_date: validated.endDate,
      is_active: validated.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    throw new Error(`Failed to update advertisement: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function deleteAd(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('advertisements')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete advertisement: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true };
}

export async function toggleAdActive(id: string) {
  const supabase = createAdminClient();

  const { data: oldAd, error: fetchErr } = await supabase
    .from('advertisements')
    .select('is_active')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldAd) {
    throw new Error('Advertisement not found');
  }

  const { data: ad, error: updateErr } = await supabase
    .from('advertisements')
    .update({
      is_active: !oldAd.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    throw new Error(`Failed to toggle advertisement: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.ADVERTISEMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_ADS);

  return { success: true, data: ad };
}

export async function recordImpression(id: string) {
  const supabase = createAdminClient();
  const { data: ad } = await supabase.from('advertisements').select('impressions').eq('id', id).maybeSingle();
  const current = Number(ad?.impressions || 0);

  await supabase
    .from('advertisements')
    .update({ impressions: current + 1 })
    .eq('id', id);

  return { success: true };
}

export async function recordClick(id: string) {
  const supabase = createAdminClient();
  const { data: ad } = await supabase.from('advertisements').select('clicks').eq('id', id).maybeSingle();
  const current = Number(ad?.clicks || 0);

  await supabase
    .from('advertisements')
    .update({ clicks: current + 1 })
    .eq('id', id);

  return { success: true };
}
