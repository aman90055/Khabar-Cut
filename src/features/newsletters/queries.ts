'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createNewsletter, 
  updateNewsletter, 
  sendNewsletter, 
  deleteNewsletter, 
  subscribe, 
  unsubscribe, 
  confirmSubscription 
} from './actions';
import type { 
  NewsletterFilters, 
  SubscriberFilters, 
  CreateNewsletterInput, 
  UpdateNewsletterInput, 
  SubscribeInput, 
  UnsubscribeInput 
} from './types';

export function useNewsletters(filters?: NewsletterFilters) {
  return useQuery({
    queryKey: queryKeys.newsletters.list(filters),
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
      const res = await fetch(`/api/newsletters${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch newsletters list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useSubscribers(filters?: SubscriberFilters) {
  return useQuery({
    queryKey: queryKeys.newsletters.subscribers(filters),
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
      const res = await fetch(`/api/subscribers${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch subscribers list');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCreateNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNewsletterInput) => {
      const res = await createNewsletter(data);
      if (!res.success) throw new Error('Failed to create newsletter');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useUpdateNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNewsletterInput }) => {
      const res = await updateNewsletter(id, data);
      if (!res.success) throw new Error('Failed to update newsletter');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useSendNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await sendNewsletter(id);
      if (!res.success) throw new Error('Failed to send newsletter');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useDeleteNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNewsletter(id);
      if (!res.success) throw new Error('Failed to delete newsletter');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubscribeInput) => {
      const res = await subscribe(data);
      if (!res.success) throw new Error('Failed to subscribe');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UnsubscribeInput) => {
      const res = await unsubscribe(data);
      if (!res.success) throw new Error('Failed to unsubscribe');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}

export function useConfirmSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await confirmSubscription(id);
      if (!res.success) throw new Error('Failed to confirm subscription');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletters.all });
    },
  });
}
