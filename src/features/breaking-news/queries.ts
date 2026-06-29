'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createBreakingNews, 
  updateBreakingNews, 
  deleteBreakingNews, 
  toggleBreakingNewsActive 
} from './actions';
import type { CreateBreakingNewsInput, UpdateBreakingNewsInput } from './types';

export function useBreakingNews(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.breakingNews.list(filters),
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
      const res = await fetch(`/api/breaking-news${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch breaking news list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useActiveBreakingNews() {
  return useQuery({
    queryKey: queryKeys.breakingNews.active(),
    queryFn: async () => {
      const res = await fetch('/api/breaking-news/active');
      if (!res.ok) throw new Error('Failed to fetch active breaking news');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCreateBreakingNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBreakingNewsInput) => {
      const res = await createBreakingNews(data);
      if (!res.success) throw new Error('Failed to create breaking news');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breakingNews.all });
    },
  });
}

export function useUpdateBreakingNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBreakingNewsInput }) => {
      const res = await updateBreakingNews(id, data);
      if (!res.success) throw new Error('Failed to update breaking news');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breakingNews.all });
    },
  });
}

export function useDeleteBreakingNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBreakingNews(id);
      if (!res.success) throw new Error('Failed to delete breaking news');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breakingNews.all });
    },
  });
}

export function useToggleBreakingNewsActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await toggleBreakingNewsActive(id);
      if (!res.success) throw new Error('Failed to toggle breaking news status');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breakingNews.all });
    },
  });
}
