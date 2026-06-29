'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission, requireAuth } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import * as userDb from '@/server/db/users';
import { 
  createUserSchema, 
  updateUserSchema, 
  updateProfileSchema, 
  changeRoleSchema 
} from './schemas';
import type { CreateUserInput, UpdateUserInput } from './types';
import { prisma } from '@/lib/prisma';

export async function createUser(input: CreateUserInput) {
  const admin = await requirePermission('users', 'create');
  const validated = createUserSchema.parse(input);

  // Generates dummy authId if creating manually. Typically sync is done via Supabase triggers or callback.
  const authId = `manual_${Date.now()}`;

  const user = await userDb.createUser({
    email: validated.email,
    fullName: validated.fullName,
    phone: validated.phone,
    bio: validated.bio,
    authId,
    authProvider: 'email',
    role: {
      connect: { id: validated.roleId },
    },
  });

  await createAuditLog({
    userId: admin.id,
    action: 'CREATE_USER',
    entityType: 'user',
    entityId: user.id,
    newValues: JSON.parse(JSON.stringify(user)),
  });

  revalidateTag(CACHE_TAGS.USERS);
  revalidatePath(CACHE_PATHS.ADMIN_USERS);

  return { success: true, data: user };
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const admin = await requirePermission('users', 'update');
  const validated = updateUserSchema.parse({ ...input, id });

  const oldUser = await userDb.findUserById(id);
  if (!oldUser) {
    throw new Error('User not found');
  }

  const user = await userDb.updateUser(id, {
    email: validated.email,
    fullName: validated.fullName,
    phone: validated.phone,
    bio: validated.bio,
    role: {
      connect: { id: validated.roleId },
    },
  });

  await createAuditLog({
    userId: admin.id,
    action: 'UPDATE_USER',
    entityType: 'user',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldUser)),
    newValues: JSON.parse(JSON.stringify(user)),
  });

  revalidateTag(CACHE_TAGS.USERS);
  revalidatePath(CACHE_PATHS.ADMIN_USERS);

  return { success: true, data: user };
}

export async function deleteUser(id: string) {
  const admin = await requirePermission('users', 'delete');

  const oldUser = await userDb.findUserById(id);
  if (!oldUser) {
    throw new Error('User not found');
  }

  await userDb.softDeleteUser(id);

  await createAuditLog({
    userId: admin.id,
    action: 'DELETE_USER',
    entityType: 'user',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldUser)),
  });

  revalidateTag(CACHE_TAGS.USERS);
  revalidatePath(CACHE_PATHS.ADMIN_USERS);

  return { success: true };
}

export async function changeUserRole(input: { userId: string; roleId: string }) {
  const admin = await requirePermission('users', 'update');
  const validated = changeRoleSchema.parse(input);

  const oldUser = await userDb.findUserById(validated.userId);
  if (!oldUser) {
    throw new Error('User not found');
  }

  const user = await userDb.updateUser(validated.userId, {
    role: {
      connect: { id: validated.roleId },
    },
  });

  await createAuditLog({
    userId: admin.id,
    action: 'CHANGE_USER_ROLE',
    entityType: 'user',
    entityId: validated.userId,
    oldValues: JSON.parse(JSON.stringify(oldUser)),
    newValues: JSON.parse(JSON.stringify(user)),
  });

  revalidateTag(CACHE_TAGS.USERS);
  revalidatePath(CACHE_PATHS.ADMIN_USERS);

  return { success: true, data: user };
}

export async function toggleUserActive(id: string) {
  const admin = await requirePermission('users', 'update');

  const oldUser = await userDb.findUserById(id);
  if (!oldUser) {
    throw new Error('User not found');
  }

  const user = await userDb.updateUser(id, {
    isActive: !oldUser.isActive,
  });

  await createAuditLog({
    userId: admin.id,
    action: 'TOGGLE_USER_ACTIVE',
    entityType: 'user',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldUser)),
    newValues: JSON.parse(JSON.stringify(user)),
  });

  revalidateTag(CACHE_TAGS.USERS);
  revalidatePath(CACHE_PATHS.ADMIN_USERS);

  return { success: true, data: user };
}

export async function updateProfile(input: {
  fullName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}) {
  const currentUser = await requireAuth();
  const validated = updateProfileSchema.parse(input);

  const user = await userDb.updateUser(currentUser.id, {
    fullName: validated.fullName,
    bio: validated.bio,
    avatarUrl: validated.avatarUrl,
    phone: validated.phone,
  });

  await createAuditLog({
    userId: currentUser.id,
    action: 'UPDATE_PROFILE',
    entityType: 'user',
    entityId: currentUser.id,
    oldValues: JSON.parse(JSON.stringify(currentUser)),
    newValues: JSON.parse(JSON.stringify(user)),
  });

  revalidateTag(CACHE_TAGS.USERS);

  return { success: true, data: user };
}
