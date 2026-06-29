'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { upsertSeoMetadata, getSeoMetadata, deleteSeoMetadata } from './actions';
import type { SeoMetadataInput } from './types';

export function useSeoMetadata(entityType: string, entityId: string) {
  return useQuery({
    queryKey: queryKeys.seo.metadata(entityType, entityId),
    queryFn: async () => {
      const res = await getSeoMetadata(entityType, entityId);
      if (!res.success) throw new Error('Failed to fetch SEO metadata');
      return res.data;
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useUpsertSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SeoMetadataInput) => {
      const res = await upsertSeoMetadata(data);
      if (!res.success) throw new Error('Failed to upsert SEO metadata');
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.seo.metadata(data.entityType, data.entityId) 
        });
      }
    },
  });
}

export function useDeleteSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
      const res = await deleteSeoMetadata(entityType, entityId);
      if (!res.success) throw new Error('Failed to delete SEO metadata');
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.seo.metadata(variables.entityType, variables.entityId) 
      });
    },
  });
}
