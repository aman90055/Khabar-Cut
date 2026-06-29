import { z } from 'zod';
import { uuidSchema, emailSchema } from '@/utils/validators';

export const newsletterStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED']);

export const createNewsletterSchema = z.object({
  title: z.string().min(3).max(200),
  subject: z.string().min(3).max(200),
  content: z.any().optional().nullable(),
  status: newsletterStatusSchema.default('DRAFT'),
});

export const updateNewsletterSchema = createNewsletterSchema.partial().extend({
  id: uuidSchema,
});

export const subscribeSchema = z.object({
  email: emailSchema,
  name: z.string().max(100).optional().nullable(),
  source: z.string().optional().nullable(),
  preferences: z.record(z.boolean()).optional(),
});

export const unsubscribeSchema = z.object({
  email: emailSchema,
});

export const newsletterFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: newsletterStatusSchema.optional(),
});

export const subscriberFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});
