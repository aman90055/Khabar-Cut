'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug, calculateWordCount, calculateReadingTime } from '@/lib/utils';
import { 
  createArticleSchema, 
  updateArticleSchema 
} from './schemas';
import type { CreateArticleInput, UpdateArticleInput } from './types';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';

export async function createArticle(input: CreateArticleInput) {
  const validated = createArticleSchema.parse(input);
  const supabase = createAdminClient();

  const slug = validated.slug || generateSlug(validated.title);
  const wordCount = calculateWordCount(validated.content);
  const readingTime = calculateReadingTime(wordCount);

  // Find author
  const { data: authors } = await supabase.from('authors').select('id').limit(1);
  const authorId = authors && authors.length > 0 ? authors[0].id : null;

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title: validated.title,
      slug,
      excerpt: validated.excerpt || null,
      content: validated.content || {},
      category_id: validated.categoryId,
      featured_image_id: validated.featuredImageId || null,
      status: validated.status || 'DRAFT',
      visibility: validated.visibility || 'PUBLIC',
      priority: validated.priority || 'STANDARD',
      is_featured: validated.isFeatured ?? false,
      is_breaking: validated.isBreaking ?? false,
      state_id: validated.stateId || null,
      district_id: validated.districtId || null,
      scheduled_at: validated.scheduledAt || null,
      word_count: wordCount,
      reading_time: readingTime,
      author_id: authorId,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create article: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const validated = updateArticleSchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldArticle, error: fetchErr } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldArticle) {
    throw new Error('Article not found');
  }

  const wordCount = validated.content ? calculateWordCount(validated.content) : (oldArticle.word_count ?? 0);
  const readingTime = validated.content ? calculateReadingTime(wordCount) : (oldArticle.reading_time ?? 1);
  const slug = validated.title ? (validated.slug || generateSlug(validated.title)) : oldArticle.slug;

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) updateData.title = validated.title;
  if (slug !== undefined) updateData.slug = slug;
  if (validated.excerpt !== undefined) updateData.excerpt = validated.excerpt;
  if (validated.content !== undefined) updateData.content = validated.content;
  if (validated.categoryId !== undefined) updateData.category_id = validated.categoryId;
  if (validated.featuredImageId !== undefined) updateData.featured_image_id = validated.featuredImageId;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.visibility !== undefined) updateData.visibility = validated.visibility;
  if (validated.priority !== undefined) updateData.priority = validated.priority;
  if (validated.isFeatured !== undefined) updateData.is_featured = validated.isFeatured;
  if (validated.isBreaking !== undefined) updateData.is_breaking = validated.isBreaking;
  if (validated.stateId !== undefined) updateData.state_id = validated.stateId;
  if (validated.districtId !== undefined) updateData.district_id = validated.districtId;
  if (validated.scheduledAt !== undefined) updateData.scheduled_at = validated.scheduledAt;
  updateData.word_count = wordCount;
  updateData.reading_time = readingTime;

  const { data: article, error: updateErr } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    throw new Error(`Failed to update article: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function deleteArticle(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true };
}

export async function publishArticle(id: string) {
  const supabase = createAdminClient();

  const { data: article, error } = await supabase
    .from('articles')
    .update({
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to publish article: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function archiveArticle(id: string) {
  const supabase = createAdminClient();

  const { data: article, error } = await supabase
    .from('articles')
    .update({
      status: 'ARCHIVED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to archive article: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.ARTICLES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_ARTICLES);

  return { success: true, data: article };
}

export async function incrementViewCount(id: string) {
  const supabase = createAdminClient();
  const { data: article } = await supabase.from('articles').select('view_count').eq('id', id).maybeSingle();
  const currentCount = Number(article?.view_count || 0);

  await supabase
    .from('articles')
    .update({ view_count: currentCount + 1 })
    .eq('id', id);

  return { success: true };
}
