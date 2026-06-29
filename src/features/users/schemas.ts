import { z } from 'zod';
import { uuidSchema, emailSchema, phoneSchema } from '@/utils/validators';

export const createUserSchema = z.object({
  email: emailSchema,
  fullName: z.string().min(2).max(100),
  roleId: uuidSchema,
  phone: phoneSchema.optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: uuidSchema,
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable().or(z.literal('')),
  phone: phoneSchema,
});

export const changeRoleSchema = z.object({
  userId: uuidSchema,
  roleId: uuidSchema,
});

export const userFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  roleId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});
