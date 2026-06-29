'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { generateSlug } from '@/lib/utils';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import * as categoryDb from '@/server/db/categories';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  reorderCategoriesSchema 
} from './schemas';
import type { CreateCategoryInput, UpdateCategoryInput } from './types';

export async function createCategory(input: CreateCategoryInput) {
  const user = await requirePermission('categories', 'create');
  const validated = createCategorySchema.parse(input);

  const slug = validated.slug || generateSlug(validated.name);

  // Check if slug exists
  const exists = await categoryDb.checkCategorySlugExists(slug);
  if (exists) {
    throw new Error('Category slug already exists');
  }

  const category = await categoryDb.createCategory({
    name: validated.name,
    slug,
    description: validated.description,
    icon: validated.icon,
    color: validated.color,
    parent: validated.parentId ? { connect: { id: validated.parentId } } : undefined,
    sortOrder: validated.sortOrder,
    isActive: validated.isActive,
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_CATEGORY',
    entityType: 'category',
    entityId: category.id,
    newValues: JSON.parse(JSON.stringify(category)),
  });

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true, data: category };
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const user = await requirePermission('categories', 'update');
  const validated = updateCategorySchema.parse({ ...input, id });

  const oldCategory = await categoryDb.findCategoryById(id);
  if (!oldCategory) {
    throw new Error('Category not found');
  }

  const slug = validated.name ? (validated.slug || generateSlug(validated.name)) : oldCategory.slug;

  if (slug !== oldCategory.slug) {
    const exists = await categoryDb.checkCategorySlugExists(slug, id);
    if (exists) {
      throw new Error('Category slug already exists');
    }
  }

  const category = await categoryDb.updateCategory(id, {
    name: validated.name,
    slug,
    description: validated.description,
    icon: validated.icon,
    color: validated.color,
    parent: validated.parentId !== undefined
      ? (validated.parentId 
          ? { connect: { id: validated.parentId } } 
          : { disconnect: true })
      : undefined,
    sortOrder: validated.sortOrder,
    isActive: validated.isActive,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_CATEGORY',
    entityType: 'category',
    entityId: category.id,
    oldValues: JSON.parse(JSON.stringify(oldCategory)),
    newValues: JSON.parse(JSON.stringify(category)),
  });

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true, data: category };
}

export async function deleteCategory(id: string) {
  const user = await requirePermission('categories', 'delete');

  const oldCategory = await categoryDb.findCategoryById(id);
  if (!oldCategory) {
    throw new Error('Category not found');
  }

  const category = await categoryDb.softDeleteCategory(id);

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_CATEGORY',
    entityType: 'category',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldCategory)),
  });

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true };
}

export async function reorderCategories(items: Array<{ id: string; sortOrder: number }>) {
  const user = await requirePermission('categories', 'update');
  const validated = reorderCategoriesSchema.parse(items);

  await categoryDb.reorderCategories(validated);

  await createAuditLog({
    userId: user.id,
    action: 'REORDER_CATEGORIES',
    entityType: 'category',
    entityId: 'batch',
    newValues: validated,
  });

  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath(CACHE_PATHS.HOME);
  revalidatePath(CACHE_PATHS.ADMIN_CATEGORIES);

  return { success: true };
}
