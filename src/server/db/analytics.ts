import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface CreateAnalyticsEventData {
  articleId?: string;
  pagePath: string;
  eventType: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  country?: string;
  region?: string;
  deviceType?: string;
  sessionId?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export async function createAnalyticsEvent(data: CreateAnalyticsEventData) {
  return prisma.analytics.create({
    data: {
      pagePath: data.pagePath,
      eventType: data.eventType,
      referrer: data.referrer,
      userAgent: data.userAgent,
      ipHash: data.ipHash,
      country: data.country,
      region: data.region,
      deviceType: data.deviceType,
      sessionId: data.sessionId,
      ...(data.articleId && {
        article: { connect: { id: data.articleId } },
      }),
    },
  });
}

export async function getArticleAnalytics(
  articleId: string,
  dateRange?: DateRange,
) {
  const where: Prisma.AnalyticsWhereInput = {
    articleId,
    deletedAt: null,
    ...(dateRange && {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    }),
  };

  const [totalViews, uniqueViews] = await Promise.all([
    prisma.analytics.count({ where }),
    prisma.analytics.groupBy({
      by: ['ipHash'],
      where,
      _count: true,
    }),
  ]);

  return {
    totalViews,
    uniqueVisitors: uniqueViews.length,
  };
}

export async function getSiteSummary(dateRange?: DateRange) {
  const where: Prisma.AnalyticsWhereInput = {
    deletedAt: null,
    ...(dateRange && {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    }),
  };

  const [totalViews, uniqueVisitors, deviceBreakdown, locationBreakdown] =
    await Promise.all([
      prisma.analytics.count({ where }),
      prisma.analytics.groupBy({
        by: ['ipHash'],
        where,
        _count: true,
      }),
      prisma.analytics.groupBy({
        by: ['deviceType'],
        where: { ...where, deviceType: { not: null } },
        _count: true,
      }),
      prisma.analytics.groupBy({
        by: ['country'],
        where: { ...where, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 20,
      }),
    ]);

  return {
    totalViews,
    uniqueVisitors: uniqueVisitors.length,
    deviceBreakdown: deviceBreakdown.map((d) => ({
      deviceType: d.deviceType ?? 'unknown',
      count: d._count,
    })),
    locationBreakdown: locationBreakdown.map((l) => ({
      country: l.country ?? 'unknown',
      count: l._count,
    })),
  };
}

export async function getTopArticles(limit: number, dateRange?: DateRange) {
  const where: Prisma.AnalyticsWhereInput = {
    deletedAt: null,
    articleId: { not: null },
    ...(dateRange && {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    }),
  };

  const results = await prisma.analytics.groupBy({
    by: ['articleId'],
    where,
    _count: { articleId: true },
    orderBy: { _count: { articleId: 'desc' } },
    take: limit,
  });

  const articleIds = results
    .map((r) => r.articleId)
    .filter((id): id is string => id !== null);

  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds }, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
    },
  });

  return results.map((r) => {
    const article = articles.find((a) => a.id === r.articleId);
    return {
      articleId: r.articleId,
      title: article?.title ?? 'Unknown',
      slug: article?.slug ?? '',
      views: r._count.articleId,
      totalViewCount: article ? Number(article.viewCount) : 0,
    };
  });
}

export async function getDailyStats(dateRange: DateRange) {
  const events = await prisma.analytics.findMany({
    where: {
      deletedAt: null,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    select: {
      createdAt: true,
      ipHash: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const dailyMap = new Map<
    string,
    { views: number; uniqueIps: Set<string> }
  >();

  for (const event of events) {
    const dateKey = event.createdAt.toISOString().split('T')[0]!;
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { views: 0, uniqueIps: new Set() });
    }
    const day = dailyMap.get(dateKey)!;
    day.views++;
    if (event.ipHash) {
      day.uniqueIps.add(event.ipHash);
    }
  }

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    views: data.views,
    uniqueVisitors: data.uniqueIps.size,
  }));
}
