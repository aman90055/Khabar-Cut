'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createLiveBlog, 
  updateLiveBlog, 
  endLiveBlog, 
  addEntry, 
  pinEntry, 
  deleteEntry 
} from './actions';
import type { 
  LiveBlogFilters, 
  CreateLiveBlogInput, 
  UpdateLiveBlogInput, 
  CreateLiveBlogEntryInput 
} from './types';

export function useLiveBlogs(filters?: LiveBlogFilters) {
  return useQuery({
    queryKey: queryKeys.liveBlogs.list(filters),
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
      const res = await fetch(`/api/live-blogs${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch live blogs list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useLiveBlog(slug: string) {
  return useQuery({
    queryKey: queryKeys.liveBlogs.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/live-blogs/by-slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch live blog details');
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useCreateLiveBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLiveBlogInput) => {
      const res = await createLiveBlog(data);
      if (!res.success) throw new Error('Failed to create live blog');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
    },
  });
}

export function useUpdateLiveBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLiveBlogInput }) => {
      const res = await updateLiveBlog(id, data);
      if (!res.success) throw new Error('Failed to update live blog');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.detail(data.slug) });
      }
    },
  });
}

export function useEndLiveBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await endLiveBlog(id);
      if (!res.success) throw new Error('Failed to end live blog');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.detail(data.slug) });
      }
    },
  });
}

export function useAddLiveBlogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLiveBlogEntryInput) => {
      const res = await addEntry(data);
      if (!res.success) throw new Error('Failed to add live blog entry');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
    },
  });
}

export function usePinLiveBlogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await pinEntry(id, isPinned);
      if (!res.success) throw new Error('Failed to pin/unpin live blog entry');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
    },
  });
}

export function useDeleteLiveBlogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteEntry(id);
      if (!res.success) throw new Error('Failed to delete live blog entry');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveBlogs.all });
    },
  });
}
