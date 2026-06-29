'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { 
  getSettingAction, 
  getSettingsByGroupAction, 
  updateSettingAction, 
  updateSettingsBatchAction 
} from './actions';
import type { UpdateSettingInput } from './types';

export function useSettings(group: string) {
  return useQuery({
    queryKey: queryKeys.settings.group(group),
    queryFn: async () => {
      const res = await getSettingsByGroupAction(group);
      if (!res.success) throw new Error(`Failed to fetch settings for group: ${group}`);
      return res.data;
    },
    enabled: !!group,
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: queryKeys.settings.key(key),
    queryFn: async () => {
      const res = await getSettingAction(key);
      if (!res.success) throw new Error(`Failed to fetch setting: ${key}`);
      return res.data;
    },
    enabled: !!key,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateSettingInput }) => {
      const res = await updateSettingAction(key, data);
      if (!res.success) throw new Error('Failed to update setting');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      if (data?.key) {
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.key(data.key) });
      }
      if (data?.group) {
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.group(data.group) });
      }
    },
  });
}

export function useUpdateSettingsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ key: string; value: any }>) => {
      const res = await updateSettingsBatchAction(items);
      if (!res.success) throw new Error('Failed to update settings batch');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
