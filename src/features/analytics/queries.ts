'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/store/query-keys';
import { trackPageView, getAnalyticsSummary, getDailyStats, getTopArticles } from './actions';
import type { AnalyticsFilters, TrackEventInput } from './types';

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(filters),
    queryFn: async () => {
      const res = await getAnalyticsSummary(filters);
      if (!res.success) throw new Error('Failed to retrieve analytics summary');
      return res.data;
    },
  });
}

export function useDailyStats(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.daily(filters),
    queryFn: async () => {
      const res = await getDailyStats(filters);
      if (!res.success) throw new Error('Failed to retrieve daily stats');
      return res.data;
    },
  });
}

export function useTopArticles(limit = 10, filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.topArticles(limit),
    queryFn: async () => {
      const res = await getTopArticles(limit, filters);
      if (!res.success) throw new Error('Failed to retrieve top articles stats');
      return res.data;
    },
  });
}

export function useTrackPageView() {
  return useMutation({
    mutationFn: async (data: TrackEventInput) => {
      const res = await trackPageView(data);
      if (!res.success) throw new Error('Failed to track page view');
      return res.data;
    },
  });
}
