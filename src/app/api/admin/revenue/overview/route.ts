// =============================================================================
// GET /api/admin/revenue/overview — Revenue KPI metrics
// =============================================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Revenue snapshots aggregation
    const [todayRevenue, monthRevenue, yearRevenue, prevMonthRevenue] = await Promise.all([
      prisma.revenueSnapshot.aggregate({
        where: { date: { gte: todayStart } },
        _sum: { revenue: true, impressions: true, clicks: true },
      }),
      prisma.revenueSnapshot.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { revenue: true, impressions: true, clicks: true },
      }),
      prisma.revenueSnapshot.aggregate({
        where: { date: { gte: yearStart } },
        _sum: { revenue: true },
      }),
      prisma.revenueSnapshot.aggregate({
        where: { date: { gte: prevMonthStart, lt: monthStart } },
        _sum: { revenue: true },
      }),
    ]);

    // Subscription metrics
    const [activeSubscribers, totalSubscribers] = await Promise.all([
      prisma.userSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.userSubscription.count(),
    ]);

    // MRR from active subscriptions
    const activeSubs = await prisma.userSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = 0;
    for (const sub of activeSubs) {
      const price = Number(sub.plan.price);
      switch (sub.plan.billingCycle) {
        case 'MONTHLY': mrr += price; break;
        case 'QUARTERLY': mrr += price / 3; break;
        case 'ANNUAL': mrr += price / 12; break;
        case 'LIFETIME': mrr += 0; break;
      }
    }

    // Revenue by source (current month)
    const revenueBySource = await prisma.revenueSnapshot.groupBy({
      by: ['source'],
      where: { date: { gte: monthStart } },
      _sum: { revenue: true, impressions: true, clicks: true },
      orderBy: { _sum: { revenue: 'desc' } },
    });

    const totalMonthRev = Number(monthRevenue._sum.revenue || 0);
    const sourceBreakdown = revenueBySource.map((s) => {
      const rev = Number(s._sum.revenue || 0);
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
      return {
        source: s.source,
        label: sourceLabels[s.source] || s.source,
        revenue: rev,
        percentage: totalMonthRev > 0 ? (rev / totalMonthRev) * 100 : 0,
        change: 0, // TODO: compute with prev month comparison
      };
    });

    // Top advertiser campaigns
    const topCampaigns = await prisma.adCampaign.findMany({
      where: { status: 'ACTIVE' },
      include: { advertiser: true },
      orderBy: { impressions: 'desc' },
      take: 5,
    });

    const topAdvertisers = topCampaigns.map((c) => ({
      id: c.advertiser.id,
      companyName: c.advertiser.companyName,
      logoUrl: c.advertiser.logoUrl,
      totalSpend: Number(c.advertiser.totalSpend),
      activeCampaigns: 1,
      impressions: Number(c.impressions),
      clicks: Number(c.clicks),
    }));

    // Ad slot performance
    const adSlots = await prisma.adSlot.findMany({
      where: { isActive: true },
      take: 8,
    });

    const topAdSlots = adSlots.map((slot) => ({
      position: slot.position,
      name: slot.name,
      impressions: 0,
      clicks: 0,
      ctr: Number(slot.avgCtr || 0),
      rpm: Number(slot.avgCpm || 0),
      revenue: 0,
      fillRate: Number(slot.fillRate || 0),
    }));

    // Revenue forecast (simple linear extrapolation)
    const todayRev = Number(todayRevenue._sum.revenue || 0);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? totalMonthRev / dayOfMonth : 0;
    const forecast7d = dailyAvg * 7;
    const forecast30d = dailyAvg * 30;

    // CTR and RPM
    const todayImpressions = Number(todayRevenue._sum.impressions || 0);
    const todayClicks = Number(todayRevenue._sum.clicks || 0);
    const todayCtr = todayImpressions > 0 ? (todayClicks / todayImpressions) * 100 : 0;
    const todayRpm = todayImpressions > 0 ? (todayRev / todayImpressions) * 1000 : 0;

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue: todayRev,
        todayImpressions,
        todayClicks,
        todayCtr,
        todayRpm,
        monthRevenue: totalMonthRev,
        monthImpressions: Number(monthRevenue._sum.impressions || 0),
        yearRevenue: Number(yearRevenue._sum.revenue || 0),
        prevMonthRevenue: Number(prevMonthRevenue._sum.revenue || 0),
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
