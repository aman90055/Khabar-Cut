'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';
import { createVideoSchema, updateVideoSchema } from './schemas';
import type { CreateVideoInput, UpdateVideoInput } from './types';

export async function createVideo(input: CreateVideoInput) {
  const validated = createVideoSchema.parse(input);
  const supabase = createAdminClient();

  const slug = validated.slug || generateSlug(validated.title);

  // Default author fallback if needed
  const { data: authors } = await supabase.from('authors').select('id').limit(1);
  const authorId = authors && authors.length > 0 ? authors[0].id : null;

  if (!authorId) {
    throw new Error('No author profile found');
  }

  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      title: validated.title,
      slug,
      description: validated.description || null,
      video_url: validated.videoUrl,
      thumbnail_url: validated.thumbnailUrl || null,
      duration: validated.duration || null,
      category_id: validated.categoryId || null,
      status: validated.status || 'DRAFT',
      is_featured: validated.isFeatured ?? false,
      author_id: authorId,
    })
    .select('*, category:categories!category_id(*), author:authors!author_id(*)')
    .single();

  if (error) {
    throw new Error(`Failed to create video: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}

export async function updateVideo(id: string, input: UpdateVideoInput) {
  const validated = updateVideoSchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldVideo, error: fetchErr } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldVideo) {
    throw new Error('Video not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldVideo.slug;

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) updateData.title = validated.title;
  if (slug !== undefined) updateData.slug = slug;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.videoUrl !== undefined) updateData.video_url = validated.videoUrl;
  if (validated.thumbnailUrl !== undefined) updateData.thumbnail_url = validated.thumbnailUrl;
  if (validated.duration !== undefined) updateData.duration = validated.duration;
  if (validated.categoryId !== undefined) updateData.category_id = validated.categoryId || null;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.isFeatured !== undefined) updateData.is_featured = validated.isFeatured;

  const { data: video, error } = await supabase
    .from('videos')
    .update(updateData)
    .eq('id', id)
    .select('*, category:categories!category_id(*), author:authors!author_id(*)')
    .single();

  if (error) {
    throw new Error(`Failed to update video: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}

export async function deleteVideo(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('videos')
    .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete video: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true };
}

export async function publishVideo(id: string) {
  const supabase = createAdminClient();

  const { data: video, error } = await supabase
    .from('videos')
    .update({ status: 'PUBLISHED', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, category:categories!category_id(*), author:authors!author_id(*)')
    .single();

  if (error) {
    throw new Error(`Failed to publish video: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.VIDEOS);
  revalidatePath(CACHE_PATHS.ADMIN_VIDEOS);

  return { success: true, data: video };
}
