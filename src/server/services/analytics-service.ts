import { createAnalyticsEvent, getSiteSummary, getTopArticles, getDailyStats } from '@/server/db/analytics';
import { hashIpAddress } from '@/lib/utils';

export class AnalyticsService {
  public static async trackPageView(params: {
    articleId?: string;
    pagePath: string;
    referrer?: string;
    userAgent?: string;
    ipAddress: string;
    country?: string;
    region?: string;
    deviceType?: string;
    sessionId?: string;
  }) {
    const ipHash = hashIpAddress(params.ipAddress); // Hashing local IP for GDPR/Privacy
    return createAnalyticsEvent({
      articleId: params.articleId,
      pagePath: params.pagePath,
      eventType: 'pageview',
      referrer: params.referrer || undefined,
      userAgent: params.userAgent || undefined,
      ipHash,
      country: params.country || undefined,
      region: params.region || undefined,
      deviceType: params.deviceType || undefined,
      sessionId: params.sessionId || undefined,
    });
  }

  public static async getAnalyticsDashboard(timeframeDays = 30) {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - timeframeDays);
    const dateRange = { from, to };

    const [summary, topArticles, dailyStats] = await Promise.all([
      getSiteSummary(dateRange),
      getTopArticles(10, dateRange),
      getDailyStats(dateRange),
    ]);

    return {
      summary,
      topArticles,
      dailyStats,
    };
  }
}
