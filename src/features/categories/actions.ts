'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  reorderCategoriesSchema 
} from './schemas';
import type { CreateCategoryInput, UpdateCategoryInput } from './types';

export async function createCategory(input: CreateCategoryInput) {
  const validated = createCategorySchema.parse(input);
  const supabase = createAdminClient();

  const slug = validated.slug || generateSlug(validated.name);

  // Check if slug exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    throw new Error('Category slug already exists');
  }

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      name: validated.name,
      slug,
      description: validated.description || null,
      icon: validated.icon || null,
      color: validated.color || null,
      parent_id: validated.parentId || null,
      sort_order: validated.sortOrder ?? 0,
      is_active: validated.isActive ?? true,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true, data: category };
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const validated = updateCategorySchema.parse({ ...input, id });
  const supabase = createAdminClient();

  const { data: oldCategory, error: fetchErr } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !oldCategory) {
    throw new Error('Category not found');
  }

  const slug = validated.name ? (validated.slug || generateSlug(validated.name)) : oldCategory.slug;

  if (slug !== oldCategory.slug) {
    const { data: slugExists } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (slugExists) {
      throw new Error('Category slug already exists');
    }
  }

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.name !== undefined) updateData.name = validated.name;
  if (slug !== undefined) updateData.slug = slug;
  if (validated.description !== undefined) updateData.description = validated.description;
  if (validated.icon !== undefined) updateData.icon = validated.icon;
  if (validated.color !== undefined) updateData.color = validated.color;
  if (validated.parentId !== undefined) updateData.parent_id = validated.parentId || null;
  if (validated.sortOrder !== undefined) updateData.sort_order = validated.sortOrder;
  if (validated.isActive !== undefined) updateData.is_active = validated.isActive;

  const { data: updated, error: updateErr } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    throw new Error(`Failed to update category: ${updateErr.message}`);
  }

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true, data: updated };
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true };
}

export async function reorderCategories(items: Array<{ id: string; sortOrder: number }>) {
  const validated = reorderCategoriesSchema.parse(items);
  const supabase = createAdminClient();

  await Promise.all(
    validated.map((item) =>
      supabase
        .from('categories')
        .update({ sort_order: item.sortOrder, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    )
  );

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true };
}
