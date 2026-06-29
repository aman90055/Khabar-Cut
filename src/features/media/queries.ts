'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { uploadMedia, updateMedia, deleteMedia } from './actions';
import type { MediaFilters, UpdateMediaInput } from './types';

export function useMedia(filters?: MediaFilters) {
  return useQuery({
    queryKey: queryKeys.media.list(filters),
    queryFn: async () => {
      const queryStr = filters 
        ? '?' + new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, val]) => {
              if (val !== undefined && val !== null && val !== '') {
                acc[key] = val.toString();
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';
      const res = await fetch(`/api/media${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch media list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: queryKeys.media.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/media/${id}`);
      if (!res.ok) throw new Error('Failed to fetch media item');
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await uploadMedia(formData);
      if (!res.success) throw new Error('Failed to upload media');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMediaInput }) => {
      const res = await updateMedia(id, data);
      if (!res.success) throw new Error('Failed to update media');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(data.id) });
      }
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteMedia(id);
      if (!res.success) throw new Error('Failed to delete media');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}
