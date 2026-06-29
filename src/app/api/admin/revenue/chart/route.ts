// =============================================================================
// GET /api/admin/revenue/chart — Time-series revenue data
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const snapshots = await prisma.revenueSnapshot.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        source: true,
        revenue: true,
        impressions: true,
        clicks: true,
      },
    });

    // Group by date
    const byDate = new Map<string, {
      date: string;
      revenue: number;
      impressions: number;
      clicks: number;
      subscriptionRevenue: number;
      adRevenue: number;
    }>();

    for (const snap of snapshots) {
      const dateStr = snap.date.toISOString().split('T')[0];
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        subscriptionRevenue: 0,
        adRevenue: 0,
      };

      const rev = Number(snap.revenue);
      existing.revenue += rev;
      existing.impressions += Number(snap.impressions);
      existing.clicks += Number(snap.clicks);

      if (snap.source === 'subscription') {
        existing.subscriptionRevenue += rev;
      } else {
        existing.adRevenue += rev;
      }

      byDate.set(dateStr, existing);
    }

    const chartData = Array.from(byDate.values()).map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * 100) / 100,
      subscriptionRevenue: Math.round(d.subscriptionRevenue * 100) / 100,
      adRevenue: Math.round(d.adRevenue * 100) / 100,
    }));

    return NextResponse.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Revenue chart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
