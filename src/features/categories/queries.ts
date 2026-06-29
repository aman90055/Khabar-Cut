'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories 
} from './actions';
import type { CreateCategoryInput, UpdateCategoryInput } from './types';

export function useCategories(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
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
      const res = await fetch(`/api/categories${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/categories/by-slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch category');
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await fetch('/api/categories/tree');
      if (!res.ok) throw new Error('Failed to fetch category tree');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const res = await createCategory(data);
      if (!res.success) throw new Error('Failed to create category');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
      const res = await updateCategory(id, data);
      if (!res.success) throw new Error('Failed to update category');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(data.slug) });
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategory(id);
      if (!res.success) throw new Error('Failed to delete category');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; sortOrder: number }>) => {
      const res = await reorderCategories(items);
      if (!res.success) throw new Error('Failed to reorder categories');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
