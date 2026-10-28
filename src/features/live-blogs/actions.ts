'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';
import { 
  createLiveBlogSchema, 
  updateLiveBlogSchema, 
  createLiveBlogEntrySchema 
} from './schemas';
import type { 
  CreateLiveBlogInput, 
  UpdateLiveBlogInput, 
  CreateLiveBlogEntryInput 
} from './types';

export async function createLiveBlog(input: CreateLiveBlogInput) {
  const validated = createLiveBlogSchema.parse(input);
  const supabase = createAdminClient();

  const { data: authors } = await supabase.from('authors').select('id').limit(1);
  const authorId = authors && authors.length > 0 ? authors[0].id : null;

  if (!authorId) {
    throw new Error('Author profile not found');
  }

  const slug = validated.slug || generateSlug(validated.title);

  const { data: liveBlog, error } = await supabase
    .from('live_blogs')
    .insert({
      title: validated.title,
      slug,
      description: validated.description || null,
      status: validated.status || 'ACTIVE',
      author_id: authorId,
      started_at: new Date().toISOString(),
    })
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (error) {
    throw new Error(`Failed to create live blog: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function updateLiveBlog(id: string, input: UpdateLiveBlogInput) {
  const validated = updateLiveBlogSchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldBlog, error: fetchErr } = await supabase
    .from('live_blogs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldBlog) {
    throw new Error('Live blog not found');
  }

  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldBlog.slug;

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) updateData.title = validated.title;
  if (slug !== undefined) updateData.slug = slug;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.status !== undefined) {
    updateData.status = validated.status;
    if (validated.status === 'ENDED' && oldBlog.status !== 'ENDED') {
      updateData.ended_at = new Date().toISOString();
    }
  }

  const { data: liveBlog, error: updateErr } = await supabase
    .from('live_blogs')
    .update(updateData)
    .eq('id', id)
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (updateErr) {
    throw new Error(`Failed to update live blog: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function endLiveBlog(id: string) {
  const supabase = createAdminClient();

  const { data: liveBlog, error } = await supabase
    .from('live_blogs')
    .update({
      status: 'ENDED',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (error) {
    throw new Error(`Failed to end live blog: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: liveBlog };
}

export async function addEntry(input: CreateLiveBlogEntryInput) {
  const validated = createLiveBlogEntrySchema.parse(input);
  const supabase = createAdminClient();

  const { data: authors } = await supabase.from('authors').select('id').limit(1);
  const authorId = authors && authors.length > 0 ? authors[0].id : null;

  if (!authorId) {
    throw new Error('Author profile not found');
  }

  const { data: entry, error } = await supabase
    .from('live_blog_entries')
    .insert({
      live_blog_id: validated.liveBlogId,
      content: validated.content,
      entry_type: validated.entryType || 'STANDARD',
      is_pinned: validated.isPinned ?? false,
      author_id: authorId,
    })
    .select('*, author:authors!author_id(id, display_name, avatar_url)')
    .single();

  if (error) {
    throw new Error(`Failed to add live blog entry: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: entry };
}

export async function pinEntry(id: string, isPinned: boolean) {
  const supabase = createAdminClient();

  const { data: oldEntry, error: fetchErr } = await supabase
    .from('live_blog_entries')
    .select('live_blog_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldEntry) {
    throw new Error('Live blog entry not found');
  }

  if (isPinned) {
    await supabase
      .from('live_blog_entries')
      .update({ is_pinned: false })
      .eq('live_blog_id', oldEntry.live_blog_id);
  }

  const { data: entry, error } = await supabase
    .from('live_blog_entries')
    .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to pin live blog entry: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true, data: entry };
}

export async function deleteEntry(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('live_blog_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete live blog entry: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.LIVE_BLOGS);
  revalidatePath(CACHE_PATHS.ADMIN_LIVE_BLOGS);

  return { success: true };
}
