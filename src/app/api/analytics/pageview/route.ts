import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/server/services/analytics-service';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pagePath: string;
      articleId?: string;
      referrer?: string;
      sessionId?: string;
    };

    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = (forwarded ? forwarded.split(',')[0] : '127.0.0.1').trim();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    await AnalyticsService.trackPageView({
      pagePath: body.pagePath,
      articleId: body.articleId,
      referrer: body.referrer,
      sessionId: body.sessionId,
      ipAddress,
      userAgent,
    });
  } catch {
    // Analytics must never break the user experience — swallow all errors silently
  }

  return NextResponse.json({ success: true });
}
