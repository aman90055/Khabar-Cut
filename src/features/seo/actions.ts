'use server';

import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { seoMetadataSchema } from './schemas';
import type { SeoMetadataInput } from './types';

export async function upsertSeoMetadata(input: SeoMetadataInput) {
  const validated = seoMetadataSchema.parse(input);
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('seo_metadata')
    .select('id')
    .eq('entity_type', validated.entityType)
    .eq('entity_id', validated.entityId)
    .maybeSingle();

  const payload: Record<string, any> = {
    entity_type: validated.entityType,
    entity_id: validated.entityId,
    meta_title: validated.metaTitle || null,
    meta_description: validated.metaDescription || null,
    canonical_url: validated.canonicalUrl || null,
    og_title: validated.ogTitle || null,
    og_description: validated.ogDescription || null,
    og_image: validated.ogImage || null,
    twitter_title: validated.twitterTitle || null,
    twitter_description: validated.twitterDescription || null,
    focus_keyword: validated.focusKeyword || null,
    no_index: validated.noIndex ?? false,
    no_follow: validated.noFollow ?? false,
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from('seo_metadata')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    result = data;
  } else {
    const { data, error } = await supabase
      .from('seo_metadata')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    result = data;
  }

  revalidateTag(CACHE_TAGS.SEO);

  return { success: true, data: result };
}

export async function getSeoMetadata(entityType: string, entityId: string) {
  const supabase = createAdminClient();

  const { data: seo } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('deleted_at', null)
    .maybeSingle();

  return { success: true, data: seo };
}

export async function deleteSeoMetadata(entityType: string, entityId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('seo_metadata')
    .update({ deleted_at: new Date().toISOString() })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) {
    throw new Error(`Failed to delete SEO metadata: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.SEO);

  return { success: true };
}
