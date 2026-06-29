// =============================================================================
// /api/admin/ads/slots — Ad Slot configuration
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const slotSchema = z.object({
  name: z.string().min(1),
  position: z.enum([
    'HOME_HERO', 'HOME_SIDEBAR', 'HOME_BELOW_BREAKING',
    'CATEGORY_TOP', 'CATEGORY_SIDEBAR',
    'ARTICLE_TOP', 'ARTICLE_MIDDLE', 'ARTICLE_BOTTOM', 'ARTICLE_SIDEBAR',
    'STICKY_FOOTER', 'STICKY_SIDEBAR',
    'WEB_STORY', 'LIVE_BLOG', 'SEARCH_PAGE', 'AUTHOR_PAGE', 'PAGE_404',
    'NEWSLETTER_INLINE', 'VIDEO_PRE_ROLL', 'VIDEO_MID_ROLL',
  ]),
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isActive: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  pricePerDay: z.number().optional(),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  networkCode: z.string().optional(),
  networkProvider: z.enum(['ADSENSE', 'ADSTERRA', 'MEDIA_NET', 'TABOOLA', 'OUTBRAIN', 'MGID', 'DIRECT']).optional(),
});

export async function GET() {
  try {
    const slots = await prisma.adSlot.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { campaigns: { where: { status: 'ACTIVE' } } } },
      },
    });

    const data = slots.map((slot) => ({
      ...slot,
      pricePerDay: slot.pricePerDay ? Number(slot.pricePerDay) : null,
      pricePerWeek: slot.pricePerWeek ? Number(slot.pricePerWeek) : null,
      pricePerMonth: slot.pricePerMonth ? Number(slot.pricePerMonth) : null,
      fillRate: slot.fillRate ? Number(slot.fillRate) : null,
      avgCtr: slot.avgCtr ? Number(slot.avgCtr) : null,
      avgCpm: slot.avgCpm ? Number(slot.avgCpm) : null,
      activeCampaigns: slot._count.campaigns,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get slots error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ad slots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = slotSchema.parse(body);

    const slot = await prisma.adSlot.create({ data });
    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create slot error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ad slot' }, { status: 500 });
  }
}
