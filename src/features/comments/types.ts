import { z } from 'zod';
import type { Comment } from '@prisma/client';
import { createCommentSchema, moderateCommentSchema } from './schemas';

export interface CommentUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface CommentWithUser extends Comment {
  user: CommentUser;
  replies?: CommentWithUser[];
}

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
