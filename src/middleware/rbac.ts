import { getAuthUser } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { hasPermission } from '@/config/permissions';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireAuth() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const { data: user, error } = await adminSupabase
    .from('users')
    .select(`
      id, full_name, email, is_active,
      role:role_id ( id, name, slug, level )
    `)
    .eq('auth_id', authUser.id)
    .is('deleted_at', null)
    .single();

  if (error || !user || !user.is_active) {
    throw new UnauthorizedError('User account is inactive or not found in system database');
  }

  const userRole = Array.isArray(user.role)
    ? user.role[0]
    : (user.role as unknown as { id: string; name: string; slug: string; level: number } | null);

  if (!userRole) {
    throw new UnauthorizedError('User has no assigned role');
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    isActive: user.is_active,
    role: userRole,
  };
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
