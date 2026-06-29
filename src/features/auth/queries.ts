'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';

export function useAuthState() {
  return useQuery({
    queryKey: queryKeys.auth.state(),
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      const json = await res.json();
      return json.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
