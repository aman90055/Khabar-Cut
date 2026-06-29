import { prisma } from '@/lib/prisma';
import type { CommentStatus, Prisma } from '@prisma/client';

const commentIncludes = {
  user: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
    },
  },
  replies: {
    where: { deletedAt: null },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export async function findCommentsByArticle(
  articleId: string,
  status?: CommentStatus,
) {
  return prisma.comment.findMany({
    where: {
      articleId,
      deletedAt: null,
      parentId: null,
      ...(status && { status }),
    },
    include: commentIncludes,
    orderBy: { createdAt: 'desc' },
  });
}

export async function findCommentById(id: string) {
  return prisma.comment.findFirst({
    where: { id, deletedAt: null },
    include: commentIncludes,
  });
}

export async function createComment(data: Prisma.CommentCreateInput) {
  return prisma.comment.create({
    data,
    include: commentIncludes,
  });
}

export async function moderateComment(id: string, status: CommentStatus) {
  return prisma.comment.update({
    where: { id },
    data: { status },
    include: commentIncludes,
  });
}

export async function softDeleteComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
