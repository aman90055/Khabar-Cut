import { z } from 'zod';
import type { User, Role } from '@prisma/client';
import { createUserSchema, updateUserSchema, userFilterSchema } from './schemas';

export interface UserWithRole extends User {
  role: Role;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilters = z.infer<typeof userFilterSchema>;
