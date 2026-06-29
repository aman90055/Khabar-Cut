import { prisma } from '@/lib/prisma';
import { ROLE_PERMISSIONS } from '@/config/permissions';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export class AuthService {
  public static async handleAuthCallback(supabaseUser: SupabaseUser) {
    const email = supabaseUser.email!;
    const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Reader';
    const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

    let readerRole = await prisma.role.findUnique({
      where: { slug: 'reader' },
    });

    if (!readerRole) {
      readerRole = await prisma.role.create({
        data: {
          name: 'Reader',
          slug: 'reader',
          description: 'Default reader role',
          level: 100,
          isSystem: true,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { authId: supabaseUser.id },
      update: {
        email,
        fullName,
        avatarUrl,
        lastLoginAt: new Date(),
      },
      create: {
        authId: supabaseUser.id,
        email,
        fullName,
        avatarUrl,
        authProvider: supabaseUser.app_metadata.provider || 'email',
        roleId: readerRole.id,
        isActive: true,
        isVerified: !!supabaseUser.email_confirmed_at,
        lastLoginAt: new Date(),
      },
      include: {
        role: true,
      },
    });

    return user;
  }

  public static async getUserWithPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const roleSlug = user.role.slug;
    const permissions = ROLE_PERMISSIONS[roleSlug as keyof typeof ROLE_PERMISSIONS] || [];

    return {
      ...user,
      permissions,
    };
  }
}
