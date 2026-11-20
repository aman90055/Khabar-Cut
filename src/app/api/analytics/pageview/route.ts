import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/server/services/analytics-service';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pagePath: string;
      articleId?: string;
      referrer?: string;
      sessionId?: string;
      deviceType?: string;
    };

    const forwarded = request.headers.get('x-forwarded-for');
    const cfIp = request.headers.get('cf-connecting-ip');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = (cfIp || (forwarded ? forwarded.split(',')[0] : realIp) || '127.0.0.1').trim();
    const userAgent = request.headers.get('user-agent') ?? undefined;

    // Geographic detection from Edge CDN headers (Vercel / Cloudflare)
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'India';
    const region = request.headers.get('x-vercel-ip-country-region') || undefined;

    await AnalyticsService.trackPageView({
      pagePath: body.pagePath || '/',
      articleId: body.articleId,
      referrer: body.referrer,
      sessionId: body.sessionId,
      ipAddress,
      userAgent,
      country,
      region,
      deviceType: body.deviceType,
    });
  } catch (err: any) {
    console.error('[Analytics Track Error]:', err?.message);
  }

  return NextResponse.json({ success: true });
}
