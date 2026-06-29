'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createAd, 
  updateAd, 
  deleteAd, 
  toggleAdActive, 
  recordImpression, 
  recordClick 
} from './actions';
import type { AdFilters, CreateAdInput, UpdateAdInput } from './types';

export function useAdvertisements(filters?: AdFilters) {
  return useQuery({
    queryKey: queryKeys.advertisements.list(filters),
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
      const res = await fetch(`/api/advertisements${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch advertisements list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useActiveAds(position?: string) {
  return useQuery({
    queryKey: queryKeys.advertisements.active(position),
    queryFn: async () => {
      const queryStr = position ? `?position=${position}` : '';
      const res = await fetch(`/api/advertisements/active${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch active advertisements');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAdInput) => {
      const res = await createAd(data);
      if (!res.success) throw new Error('Failed to create advertisement');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advertisements.all });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdInput }) => {
      const res = await updateAd(id, data);
      if (!res.success) throw new Error('Failed to update advertisement');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advertisements.all });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteAd(id);
      if (!res.success) throw new Error('Failed to delete advertisement');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advertisements.all });
    },
  });
}

export function useToggleAdActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await toggleAdActive(id);
      if (!res.success) throw new Error('Failed to toggle advertisement status');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advertisements.all });
    },
  });
}

export function useRecordImpression() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await recordImpression(id);
      if (!res.success) throw new Error('Failed to record ad impression');
      return res;
    },
  });
}

export function useRecordClick() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await recordClick(id);
      if (!res.success) throw new Error('Failed to record ad click');
      return res;
    },
  });
}
