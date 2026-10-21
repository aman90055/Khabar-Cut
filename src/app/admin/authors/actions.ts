'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/middleware/rbac';
import { z } from 'zod';

const adminSupabase = createAdminClient();

const updateAuthorSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional().nullable(),
  avatarUrl: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  isVerified: z.boolean().default(false),
  socialLinks: z.object({
    twitter: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
  }).optional(),
});

export async function updateAuthor(input: z.infer<typeof updateAuthorSchema>) {
  const user = await requireAuth();
  
  // Require CEO or Editor level to update author profiles (Role levels <= 3)
  if (user.role.level > 3) {
    throw new Error('Forbidden: You do not have permission to modify author profiles');
  }

  const validated = updateAuthorSchema.parse(input);

  const { data: author, error } = await adminSupabase
    .from('authors')
    .update({
      display_name: validated.displayName,
      bio: validated.bio || null,
      avatar_url: validated.avatarUrl || null,
      is_verified: validated.isVerified,
      social_links: validated.socialLinks || {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', validated.id)
    .select()
    .single();

  if (error || !author) {
    throw new Error(error?.message || 'Failed to update author profile');
  }

  revalidatePath('/admin/authors');
  
  return { success: true, data: author };
}
