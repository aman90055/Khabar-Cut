'use server';

import { headers } from 'next/headers';
import { requirePermission } from '@/middleware/rbac';
import { hashIpAddress } from '@/lib/utils';
import * as analyticsDb from '@/server/db/analytics';
import { trackEventSchema, analyticsFilterSchema } from './schemas';
import type { TrackEventInput, AnalyticsFilters } from './types';
import { revalidateTag } from '@/lib/cache';
import { CACHE_TAGS } from '@/lib/constants';

export async function trackPageView(input: TrackEventInput) {
  const validated = trackEventSchema.parse(input);
  
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ipHash = hashIpAddress(ipAddress);
  
  const country = headersList.get('x-vercel-ip-country') || undefined;
  const region = headersList.get('x-vercel-ip-country-region') || undefined;
  
  // Basic device type detection from user-agent
  let deviceType = 'desktop';
  if (userAgent) {
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/ipad|tablet/i.test(userAgent)) deviceType = 'tablet';
  }

  const event = await analyticsDb.createAnalyticsEvent({
    articleId: validated.articleId || undefined,
    pagePath: validated.pagePath,
    eventType: validated.eventType,
    referrer: validated.referrer || undefined,
    userAgent,
    ipHash,
    country,
    region,
    deviceType,
  });

  revalidateTag(CACHE_TAGS.ANALYTICS);

  return { success: true, data: { id: event.id } };
}

export async function getAnalyticsSummary(filters?: AnalyticsFilters) {
  await requirePermission('analytics', 'read');
  
  const dateRange = filters?.dateFrom && filters?.dateTo 
    ? { from: filters.dateFrom, to: filters.dateTo }
    : undefined;

  const summary = await analyticsDb.getSiteSummary(dateRange);
  return { success: true, data: summary };
}

export async function getDailyStats(filters?: AnalyticsFilters) {
  await requirePermission('analytics', 'read');
  
  const dateRange = filters?.dateFrom && filters?.dateTo 
    ? { from: filters.dateFrom, to: filters.dateTo }
    : { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() };

  const stats = await analyticsDb.getDailyStats(dateRange);
  return { success: true, data: stats };
}

export async function getTopArticles(limit = 10, filters?: AnalyticsFilters) {
  await requirePermission('analytics', 'read');
  
  const dateRange = filters?.dateFrom && filters?.dateTo 
    ? { from: filters.dateFrom, to: filters.dateTo }
    : undefined;

  const top = await analyticsDb.getTopArticles(limit, dateRange);
  return { success: true, data: top };
}
