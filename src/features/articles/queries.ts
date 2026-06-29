'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createArticle, 
  updateArticle, 
  deleteArticle, 
  publishArticle, 
  archiveArticle 
} from './actions';
import type { ArticleFilters, CreateArticleInput, UpdateArticleInput } from './types';

export function useArticles(filters?: ArticleFilters) {
  return useQuery({
    queryKey: queryKeys.articles.list(filters),
    queryFn: async () => {
      const queryStr = filters 
        ? new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, val]) => {
              if (val !== undefined && val !== null && val !== '') {
                acc[key] = val.toString();
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';
        
      const res = await fetch(`/api/articles${queryStr ? `?${queryStr}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch articles');
      }
      const json = await res.json();
      return json.data;
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/articles/by-slug/${slug}`);
      if (!res.ok) {
        throw new Error('Failed to fetch article');
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useInfiniteArticles(filters?: ArticleFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.articles.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const currentFilters = { ...filters, page: pageParam };
      const queryStr = new URLSearchParams(
        Object.entries(currentFilters).reduce((acc, [key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            acc[key] = val.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const res = await fetch(`/api/articles?${queryStr}`);
      if (!res.ok) {
        throw new Error('Failed to fetch infinite articles');
      }
      const json = await res.json();
      return json;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage.meta;
      if (!meta || meta.page >= meta.totalPages) return undefined;
      return meta.page + 1;
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateArticleInput) => {
      const res = await createArticle(data);
      if (!res.success) throw new Error('Failed to create article');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateArticleInput }) => {
      const res = await updateArticle(id, data);
      if (!res.success) throw new Error('Failed to update article');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(data.slug) });
      }
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteArticle(id);
      if (!res.success) throw new Error('Failed to delete article');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await publishArticle(id);
      if (!res.success) throw new Error('Failed to publish article');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(data.slug) });
      }
    },
  });
}

export function useArchiveArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await archiveArticle(id);
      if (!res.success) throw new Error('Failed to archive article');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(data.slug) });
      }
    },
  });
}
