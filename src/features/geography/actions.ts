'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';
import { z } from 'zod';

const stateSchema = z.object({
  name: z.string().min(2, 'State name must be at least 2 characters').max(100),
  code: z.string().min(2, 'State code must be 2 characters').max(5),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

const districtSchema = z.object({
  name: z.string().min(2, 'District name must be at least 2 characters').max(100),
  stateId: z.string().uuid(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function createState(input: z.infer<typeof stateSchema>) {
  const validated = stateSchema.parse(input);
  const slug = generateSlug(validated.name);
  const supabase = createAdminClient();

  const { data: state, error } = await supabase
    .from('states')
    .insert({
      name: validated.name,
      code: validated.code.toUpperCase(),
      slug,
      sort_order: validated.sortOrder,
      is_active: validated.isActive,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create state: ${error.message}`);
  }

  revalidatePath('/admin/states');
  return { success: true, data: state };
}

export async function updateState(id: string, input: z.infer<typeof stateSchema>) {
  const validated = stateSchema.parse(input);
  const slug = generateSlug(validated.name);
  const supabase = createAdminClient();

  const { data: state, error } = await supabase
    .from('states')
    .update({
      name: validated.name,
      code: validated.code.toUpperCase(),
      slug,
      sort_order: validated.sortOrder,
      is_active: validated.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update state: ${error.message}`);
  }

  revalidatePath('/admin/states');
  return { success: true, data: state };
}

export async function deleteState(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('states')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete state: ${error.message}`);
  }

  revalidatePath('/admin/states');
  return { success: true };
}

export async function createDistrict(input: z.infer<typeof districtSchema>) {
  const validated = districtSchema.parse(input);
  const slug = generateSlug(validated.name);
  const supabase = createAdminClient();

  const { data: district, error } = await supabase
    .from('districts')
    .insert({
      name: validated.name,
      state_id: validated.stateId,
      slug,
      sort_order: validated.sortOrder,
      is_active: validated.isActive,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create district: ${error.message}`);
  }

  revalidatePath('/admin/districts');
  return { success: true, data: district };
}

export async function updateDistrict(id: string, input: z.infer<typeof districtSchema>) {
  const validated = districtSchema.parse(input);
  const slug = generateSlug(validated.name);
  const supabase = createAdminClient();

  const { data: district, error } = await supabase
    .from('districts')
    .update({
      name: validated.name,
      state_id: validated.stateId,
      slug,
      sort_order: validated.sortOrder,
      is_active: validated.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update district: ${error.message}`);
  }

  revalidatePath('/admin/districts');
  return { success: true, data: district };
}

export async function deleteDistrict(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('districts')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete district: ${error.message}`);
  }

  revalidatePath('/admin/districts');
  return { success: true };
}
