'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';
import { createWebStorySchema, updateWebStorySchema } from './schemas';
import type { CreateWebStoryInput, UpdateWebStoryInput } from './types';

export async function createWebStory(input: CreateWebStoryInput) {
  const validated = createWebStorySchema.parse(input);
  const supabase = createAdminClient();

  const { data: authors } = await supabase.from('authors').select('id').limit(1);
  const authorId = authors && authors.length > 0 ? authors[0].id : null;

  if (!authorId) {
    throw new Error('Author profile not found');
  }

  const slug = validated.slug || generateSlug(validated.title);

  const { data: story, error } = await supabase
    .from('web_stories')
    .insert({
      title: validated.title,
      slug,
      cover_image: validated.coverImage || null,
      slides: validated.slides,
      status: validated.status || 'DRAFT',
      author_id: authorId,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (error) {
    throw new Error(`Failed to create web story: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}

export async function updateWebStory(id: string, input: UpdateWebStoryInput) {
  const validated = updateWebStorySchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldStory, error: fetchErr } = await supabase
    .from('web_stories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldStory) {
    throw new Error('Web story not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldStory.slug;

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) updateData.title = validated.title;
  if (slug !== undefined) updateData.slug = slug;
  if (validated.coverImage !== undefined) updateData.cover_image = validated.coverImage;
  if (validated.slides !== undefined) updateData.slides = validated.slides;
  if (validated.status !== undefined) {
    updateData.status = validated.status;
    if (validated.status === 'PUBLISHED' && oldStory.status !== 'PUBLISHED') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: story, error: updateErr } = await supabase
    .from('web_stories')
    .update(updateData)
    .eq('id', id)
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (updateErr) {
    throw new Error(`Failed to update web story: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}

export async function deleteWebStory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('web_stories')
    .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete web story: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true };
}

export async function publishWebStory(id: string) {
  const supabase = createAdminClient();

  const { data: story, error } = await supabase
    .from('web_stories')
    .update({
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (error) {
    throw new Error(`Failed to publish web story: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.WEB_STORIES);
  revalidatePath(CACHE_PATHS.ADMIN_WEB_STORIES);

  return { success: true, data: story };
}
