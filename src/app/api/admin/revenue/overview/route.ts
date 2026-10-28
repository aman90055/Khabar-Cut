// =============================================================================
// GET /api/admin/revenue/overview — Revenue KPI metrics
// =============================================================================
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const [
      todayRes,
      monthRes,
      yearRes,
      prevMonthRes,
      activeSubsRes,
      allSubsRes,
      topCampaignsRes,
      adSlotsRes,
    ] = await Promise.all([
      supabase.from('revenue_snapshots').select('revenue, impressions, clicks').gte('date', todayStart),
      supabase.from('revenue_snapshots').select('revenue, impressions, clicks, source').gte('date', monthStart),
      supabase.from('revenue_snapshots').select('revenue').gte('date', yearStart),
      supabase.from('revenue_snapshots').select('revenue').gte('date', prevMonthStart).lt('date', monthStart),
      supabase.from('user_subscriptions').select('*, plan:subscription_plans!plan_id(*)').eq('status', 'ACTIVE'),
      supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }),
      supabase.from('ad_campaigns').select('*, advertiser:advertisers!advertiser_id(*)').eq('status', 'ACTIVE').order('impressions', { ascending: false }).limit(5),
      supabase.from('ad_slots').select('*').eq('is_active', true).limit(8),
    ]);

    const sumRevenue = (arr: any[] | null) => (arr || []).reduce((acc, r) => acc + Number(r.revenue || 0), 0);
    const sumImpressions = (arr: any[] | null) => (arr || []).reduce((acc, r) => acc + Number(r.impressions || 0), 0);
    const sumClicks = (arr: any[] | null) => (arr || []).reduce((acc, r) => acc + Number(r.clicks || 0), 0);

    const todayRev = sumRevenue(todayRes.data);
    const todayImpressions = sumImpressions(todayRes.data);
    const todayClicks = sumClicks(todayRes.data);
    const todayCtr = todayImpressions > 0 ? (todayClicks / todayImpressions) * 100 : 0;
    const todayRpm = todayImpressions > 0 ? (todayRev / todayImpressions) * 1000 : 0;

    const totalMonthRev = sumRevenue(monthRes.data);
    const monthImpressions = sumImpressions(monthRes.data);
    const yearRevenue = sumRevenue(yearRes.data);
    const prevMonthRevenue = sumRevenue(prevMonthRes.data);

    const activeSubs = activeSubsRes.data || [];
    const activeSubscribers = activeSubs.length;
    const totalSubscribers = allSubsRes.count || 0;

    let mrr = 0;
    for (const sub of activeSubs) {
      if (sub.plan) {
        const price = Number(sub.plan.price || 0);
        switch (sub.plan.billing_cycle || sub.plan.billingCycle) {
          case 'MONTHLY': mrr += price; break;
          case 'QUARTERLY': mrr += price / 3; break;
          case 'ANNUAL': mrr += price / 12; break;
          case 'LIFETIME': mrr += 0; break;
        }
      }
    }

    // Revenue by source
    const sourceMap: Record<string, number> = {};
    for (const item of monthRes.data || []) {
      const src = item.source || 'direct';
      sourceMap[src] = (sourceMap[src] || 0) + Number(item.revenue || 0);
    }

    const sourceLabels: Record<string, string> = {
      adsense: 'Google AdSense',
      adsterra: 'Adsterra',
      media_net: 'Media.net',
      taboola: 'Taboola',
      outbrain: 'Outbrain',
      direct: 'Direct Ads',
      subscription: 'Subscriptions',
      press_release: 'Press Releases',
      marketplace: 'Marketplace',
    };

    const sourceBreakdown = Object.entries(sourceMap).map(([src, rev]) => ({
      source: src,
      label: sourceLabels[src] || src,
      revenue: rev,
      percentage: totalMonthRev > 0 ? (rev / totalMonthRev) * 100 : 0,
      change: 0,
    }));

    const topAdvertisers = (topCampaignsRes.data || []).map((c: any) => ({
      id: c.advertiser?.id,
      companyName: c.advertiser?.company_name || 'Advertiser',
      logoUrl: c.advertiser?.logo_url,
      totalSpend: Number(c.advertiser?.total_spend || 0),
      activeCampaigns: 1,
      impressions: Number(c.impressions || 0),
      clicks: Number(c.clicks || 0),
    }));

    const topAdSlots = (adSlotsRes.data || []).map((slot: any) => ({
      position: slot.position,
      name: slot.name,
      impressions: 0,
      clicks: 0,
      ctr: Number(slot.avg_ctr || 0),
      rpm: Number(slot.avg_cpm || 0),
      revenue: 0,
      fillRate: Number(slot.fill_rate || 0),
    }));

    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? totalMonthRev / dayOfMonth : 0;
    const forecast7d = dailyAvg * 7;
    const forecast30d = dailyAvg * 30;

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue: todayRev,
        todayImpressions,
        todayClicks,
        todayCtr,
        todayRpm,
        monthRevenue: totalMonthRev,
        monthImpressions,
        yearRevenue,
        prevMonthRevenue,
        totalSubscribers,
        activeSubscribers,
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(mrr * 12 * 100) / 100,
        fillRate: 0,
        avgEcpm: 0,
        revenueBySource: sourceBreakdown,
        topAdSlots,
        topAdvertisers,
        forecast7d: Math.round(forecast7d * 100) / 100,
        forecast30d: Math.round(forecast30d * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Revenue overview error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch revenue overview' }, { status: 500 });
  }
}
