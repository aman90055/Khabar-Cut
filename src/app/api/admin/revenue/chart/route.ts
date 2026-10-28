// =============================================================================
// GET /api/admin/revenue/chart — Time-series revenue data
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const supabase = createAdminClient();

    const { data: snapshots, error } = await supabase
      .from('revenue_snapshots')
      .select('date, source, revenue, impressions, clicks')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Group by date
    const byDate = new Map<string, {
      date: string;
      revenue: number;
      impressions: number;
      clicks: number;
      subscriptionRevenue: number;
      adRevenue: number;
    }>();

    for (const snap of snapshots || []) {
      const dateStr = new Date(snap.date).toISOString().split('T')[0];
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        subscriptionRevenue: 0,
        adRevenue: 0,
      };

      const rev = Number(snap.revenue || 0);
      existing.revenue += rev;
      existing.impressions += Number(snap.impressions || 0);
      existing.clicks += Number(snap.clicks || 0);

      if (snap.source === 'subscription') {
        existing.subscriptionRevenue += rev;
      } else {
        existing.adRevenue += rev;
      }

      byDate.set(dateStr, existing);
    }

    return NextResponse.json({
      success: true,
      period,
      data: Array.from(byDate.values()),
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch revenue chart' }, { status: 500 });
  }
}
