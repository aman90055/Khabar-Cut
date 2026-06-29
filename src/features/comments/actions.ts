'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import * as commentDb from '@/server/db/comments';
import { createCommentSchema, moderateCommentSchema } from './schemas';
import type { CreateCommentInput, ModerateCommentInput } from './types';

export async function createComment(input: CreateCommentInput) {
  const user = await requirePermission('comments', 'create');
  const validated = createCommentSchema.parse(input);

  const comment = await commentDb.createComment({
    content: validated.content,
    article: {
      connect: { id: validated.articleId },
    },
    user: {
      connect: { id: user.id },
    },
    ...(validated.parentId && {
      parent: {
        connect: { id: validated.parentId },
      },
    }),
  });

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_COMMENT',
    entityType: 'comment',
    entityId: comment.id,
    newValues: JSON.parse(JSON.stringify(comment)),
  });

  revalidateTag(CACHE_TAGS.COMMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_COMMENTS);

  return { success: true, data: comment };
}

export async function deleteComment(id: string) {
  const user = await requirePermission('comments', 'delete');

  const oldComment = await commentDb.findCommentById(id);
  if (!oldComment) {
    throw new Error('Comment not found');
  }

  // Check ownership if user is just a reader (level 100)
  // Super-admin level is 0. Lower level = more access.
  if (user.role.level >= 100 && oldComment.userId !== user.id) {
    throw new Error('Unauthorized to delete this comment');
  }

  const comment = await commentDb.softDeleteComment(id);

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_COMMENT',
    entityType: 'comment',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldComment)),
  });

  revalidateTag(CACHE_TAGS.COMMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_COMMENTS);

  return { success: true };
}

export async function moderateComment(input: ModerateCommentInput) {
  const user = await requirePermission('comments', 'moderate');
  const validated = moderateCommentSchema.parse(input);

  const oldComment = await commentDb.findCommentById(validated.id);
  if (!oldComment) {
    throw new Error('Comment not found');
  }

  const comment = await commentDb.moderateComment(validated.id, validated.status);

  await createAuditLog({
    userId: user.id,
    action: 'MODERATE_COMMENT',
    entityType: 'comment',
    entityId: validated.id,
    oldValues: JSON.parse(JSON.stringify(oldComment)),
    newValues: JSON.parse(JSON.stringify(comment)),
  });

  revalidateTag(CACHE_TAGS.COMMENTS);
  revalidatePath(CACHE_PATHS.ADMIN_COMMENTS);

  return { success: true, data: comment };
}
