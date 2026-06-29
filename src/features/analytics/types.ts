import { z } from 'zod';
import { trackEventSchema, analyticsFilterSchema } from './schemas';

export interface DeviceBreakdownItem {
  deviceType: string;
  count: number;
}

export interface LocationBreakdownItem {
  country: string;
  count: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  deviceBreakdown: DeviceBreakdownItem[];
  locationBreakdown: LocationBreakdownItem[];
}

export interface DailyStats {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface TopArticleStats {
  articleId: string;
  title: string;
  slug: string;
  views: number;
  totalViewCount: number;
}

export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type AnalyticsFilters = z.infer<typeof analyticsFilterSchema>;
