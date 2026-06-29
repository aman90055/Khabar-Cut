'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createVideo, 
  updateVideo, 
  deleteVideo, 
  publishVideo 
} from './actions';
import type { VideoFilters, CreateVideoInput, UpdateVideoInput } from './types';

export function useVideos(filters?: VideoFilters) {
  return useQuery({
    queryKey: queryKeys.videos.list(filters),
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
      const res = await fetch(`/api/videos${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch videos list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useVideo(slug: string) {
  return useQuery({
    queryKey: queryKeys.videos.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/videos/by-slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch video');
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVideoInput) => {
      const res = await createVideo(data);
      if (!res.success) throw new Error('Failed to create video');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVideoInput }) => {
      const res = await updateVideo(id, data);
      if (!res.success) throw new Error('Failed to update video');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(data.slug) });
      }
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteVideo(id);
      if (!res.success) throw new Error('Failed to delete video');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
    },
  });
}

export function usePublishVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await publishVideo(id);
      if (!res.success) throw new Error('Failed to publish video');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(data.slug) });
      }
    },
  });
}
