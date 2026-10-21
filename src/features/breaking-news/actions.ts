'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { createBreakingNewsSchema, updateBreakingNewsSchema } from './schemas';
import type { CreateBreakingNewsInput, UpdateBreakingNewsInput } from './types';
import crypto from 'crypto';

const adminSupabase = createAdminClient();

export async function createBreakingNews(input: CreateBreakingNewsInput) {
  const user = await requirePermission('breaking_news', 'create');
  const validated = createBreakingNewsSchema.parse(input);

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data: breaking, error } = await adminSupabase
    .from('breaking_news')
    .insert({
      id: newId,
      title: validated.title,
      article_id: validated.articleId || null,
      is_active: validated.isActive,
      priority: validated.priority,
      expires_at: validated.expiresAt ? new Date(validated.expiresAt).toISOString() : null,
      updated_at: now,
    })
    .select('*, article:articles!article_id(id, title, slug)')
    .single();

  if (error || !breaking) {
    throw new Error(error?.message || 'Failed to create breaking news');
  }

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: breaking.id,
    newValues: breaking,
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}

export async function updateBreakingNews(id: string, input: UpdateBreakingNewsInput) {
  const user = await requirePermission('breaking_news', 'update');
  const validated = updateBreakingNewsSchema.parse({ ...input, id });

  const { data: oldBreaking } = await adminSupabase
    .from('breaking_news')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  const { data: breaking, error } = await adminSupabase
    .from('breaking_news')
    .update({
      title: validated.title,
      article_id: validated.articleId || null,
      is_active: validated.isActive,
      priority: validated.priority,
      expires_at: validated.expiresAt ? new Date(validated.expiresAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, article:articles!article_id(id, title, slug)')
    .single();

  if (error || !breaking) {
    throw new Error(error?.message || 'Failed to update breaking news');
  }

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: oldBreaking,
    newValues: breaking,
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}

export async function deleteBreakingNews(id: string) {
  const user = await requirePermission('breaking_news', 'delete');

  const { data: oldBreaking } = await adminSupabase
    .from('breaking_news')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  const { error } = await adminSupabase
    .from('breaking_news')
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: oldBreaking,
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true };
}

export async function toggleBreakingNewsActive(id: string) {
  const user = await requirePermission('breaking_news', 'update');

  const { data: oldBreaking } = await adminSupabase
    .from('breaking_news')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!oldBreaking) {
    throw new Error('Breaking news alert not found');
  }

  const { data: breaking, error } = await adminSupabase
    .from('breaking_news')
    .update({
      is_active: !oldBreaking.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, article:articles!article_id(id, title, slug)')
    .single();

  if (error || !breaking) {
    throw new Error(error?.message || 'Failed to toggle status');
  }

  await createAuditLog({
    userId: user.id,
    action: 'TOGGLE_BREAKING_NEWS',
    entityType: 'breaking_news',
    entityId: id,
    oldValues: oldBreaking,
    newValues: breaking,
  });

  revalidateTag(CACHE_TAGS.BREAKING_NEWS);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_BREAKING);

  return { success: true, data: breaking };
}
