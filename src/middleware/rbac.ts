import { getAuthUser } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { hasPermission } from '@/config/permissions';

export async function requireAuth() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
    include: {
      role: true,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('User account is inactive or not found in system database');
  }

  return user;
}

export async function requireRole(minimumLevel: number) {
  const user = await requireAuth();
  
  if (user.role.level > minimumLevel) {
    throw new ForbiddenError('You do not have the required access level');
  }

  return user;
}

export async function requirePermission(resource: string, action: string) {
  const user = await requireAuth();
  
  const allowed = hasPermission(user.role.slug, resource, action);
  if (!allowed) {
    throw new ForbiddenError(`Missing permission: ${resource}:${action}`);
  }

  return user;
}
