'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createWebStory, 
  updateWebStory, 
  deleteWebStory, 
  publishWebStory 
} from './actions';
import type { WebStoryFilters, CreateWebStoryInput, UpdateWebStoryInput } from './types';

export function useWebStories(filters?: WebStoryFilters) {
  return useQuery({
    queryKey: queryKeys.webStories.list(filters),
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
      const res = await fetch(`/api/web-stories${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch web stories list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useWebStory(slug: string) {
  return useQuery({
    queryKey: queryKeys.webStories.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/web-stories/by-slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch web story');
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useCreateWebStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWebStoryInput) => {
      const res = await createWebStory(data);
      if (!res.success) throw new Error('Failed to create web story');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webStories.all });
    },
  });
}

export function useUpdateWebStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebStoryInput }) => {
      const res = await updateWebStory(id, data);
      if (!res.success) throw new Error('Failed to update web story');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webStories.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.webStories.detail(data.slug) });
      }
    },
  });
}

export function useDeleteWebStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteWebStory(id);
      if (!res.success) throw new Error('Failed to delete web story');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webStories.all });
    },
  });
}

export function usePublishWebStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await publishWebStory(id);
      if (!res.success) throw new Error('Failed to publish web story');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webStories.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.webStories.detail(data.slug) });
      }
    },
  });
}
