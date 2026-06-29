'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { prisma } from '@/lib/prisma';
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
  const user = await requirePermission('settings', 'update'); // admins configure geographics
  const validated = stateSchema.parse(input);
  const slug = generateSlug(validated.name);

  const state = await prisma.state.create({
    data: {
      name: validated.name,
      code: validated.code.toUpperCase(),
      slug,
      sortOrder: validated.sortOrder,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_STATE',
    entityType: 'state',
    entityId: state.id,
    newValues: JSON.parse(JSON.stringify(state)),
  });

  revalidatePath('/admin/states');
  return { success: true, data: state };
}

export async function updateState(id: string, input: z.infer<typeof stateSchema>) {
  const user = await requirePermission('settings', 'update');
  const validated = stateSchema.parse(input);
  const slug = generateSlug(validated.name);

  const state = await prisma.state.update({
    where: { id },
    data: {
      name: validated.name,
      code: validated.code.toUpperCase(),
      slug,
      sortOrder: validated.sortOrder,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_STATE',
    entityType: 'state',
    entityId: id,
    newValues: JSON.parse(JSON.stringify(state)),
  });

  revalidatePath('/admin/states');
  return { success: true, data: state };
}

export async function deleteState(id: string) {
  const user = await requirePermission('settings', 'delete');

  await prisma.state.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_STATE',
    entityType: 'state',
    entityId: id,
  });

  revalidatePath('/admin/states');
  return { success: true };
}

export async function createDistrict(input: z.infer<typeof districtSchema>) {
  const user = await requirePermission('settings', 'update');
  const validated = districtSchema.parse(input);
  const slug = generateSlug(validated.name);

  const district = await prisma.district.create({
    data: {
      name: validated.name,
      stateId: validated.stateId,
      slug,
      sortOrder: validated.sortOrder,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_DISTRICT',
    entityType: 'district',
    entityId: district.id,
    newValues: JSON.parse(JSON.stringify(district)),
  });

  revalidatePath('/admin/districts');
  return { success: true, data: district };
}

export async function updateDistrict(id: string, input: z.infer<typeof districtSchema>) {
  const user = await requirePermission('settings', 'update');
  const validated = districtSchema.parse(input);
  const slug = generateSlug(validated.name);

  const district = await prisma.district.update({
    where: { id },
    data: {
      name: validated.name,
      stateId: validated.stateId,
      slug,
      sortOrder: validated.sortOrder,
      isActive: validated.isActive,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_DISTRICT',
    entityType: 'district',
    entityId: id,
    newValues: JSON.parse(JSON.stringify(district)),
  });

  revalidatePath('/admin/districts');
  return { success: true, data: district };
}

export async function deleteDistrict(id: string) {
  const user = await requirePermission('settings', 'delete');

  await prisma.district.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_DISTRICT',
    entityType: 'district',
    entityId: id,
  });

  revalidatePath('/admin/districts');
  return { success: true };
}
