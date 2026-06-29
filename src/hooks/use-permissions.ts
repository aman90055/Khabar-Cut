'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ROLE_PERMISSIONS, ROLE_LEVELS } from '@/config/permissions';

export function usePermissions() {
  const supabase = createClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const res = await fetch('/api/users/me');
      if (!res.ok) return null;
      
      const json = await res.json();
      return json.data as {
        id: string;
        email: string;
        fullName: string;
        role: { slug: string; level: number; name: string };
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const userRole = profile?.role?.slug || 'reader';
  const roleLevel = profile?.role?.level ?? ROLE_LEVELS.reader;

  const hasPermission = (resource: string, action: string): boolean => {
    if (userRole === 'super-admin') return true;
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    if (!permissions) return false;
    return permissions.includes(`${resource}:${action}`);
  };

  const canAccess = (requiredLevel: number): boolean => {
    return roleLevel <= requiredLevel;
  };

  const isAdmin = userRole === 'super-admin' || userRole === 'ceo' || userRole === 'editor-in-chief' || userRole === 'managing-editor';

  return {
    hasPermission,
    canAccess,
    userRole,
    isAdmin,
    isLoading,
  };
}
