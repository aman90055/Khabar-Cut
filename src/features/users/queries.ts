'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  createUser, 
  updateUser, 
  deleteUser, 
  changeUserRole, 
  toggleUserActive, 
  updateProfile 
} from './actions';
import type { UserFilters, CreateUserInput, UpdateUserInput } from './types';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
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
      const res = await fetch(`/api/users${queryStr}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: async () => {
      const res = await fetch('/api/users/me');
      if (!res.ok) throw new Error('Failed to fetch current user');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await createUser(data);
      if (!res.success) throw new Error('Failed to create user');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const res = await updateUser(id, data);
      if (!res.success) throw new Error('Failed to update user');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteUser(id);
      if (!res.success) throw new Error('Failed to delete user');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; roleId: string }) => {
      const res = await changeUserRole(data);
      if (!res.success) throw new Error('Failed to change user role');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      }
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await toggleUserActive(id);
      if (!res.success) throw new Error('Failed to toggle user active status');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      }
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fullName?: string; bio?: string | null; avatarUrl?: string | null; phone?: string | null }) => {
      const res = await updateProfile(data);
      if (!res.success) throw new Error('Failed to update profile');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
    },
  });
}
