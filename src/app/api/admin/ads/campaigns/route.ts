// =============================================================================
// /api/admin/ads/campaigns — Ad Campaign CRUD
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const campaignSchema = z.object({
  advertiserId: z.string().uuid(),
  slotId: z.string().uuid().optional(),
  name: z.string().min(1),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  budget: z.number().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetStates: z.array(z.string()).optional(),
  targetDevices: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const advertiserId = searchParams.get('advertiserId');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (advertiserId) where.advertiserId = advertiserId;

    const [campaigns, total] = await Promise.all([
      prisma.adCampaign.findMany({
        where,
        include: {
          advertiser: true,
          slot: true,
          creatives: { where: { deletedAt: null } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.adCampaign.count({ where }),
    ]);

    const data = campaigns.map((c) => ({
      ...c,
      budget: Number(c.budget),
      spent: Number(c.spent),
      impressions: Number(c.impressions),
      clicks: Number(c.clicks),
      conversions: Number(c.conversions),
      ctr: c.ctr ? Number(c.ctr) : null,
      cpm: c.cpm ? Number(c.cpm) : null,
      advertiser: {
        ...c.advertiser,
        totalSpend: Number(c.advertiser.totalSpend),
        totalImpressions: Number(c.advertiser.totalImpressions),
        totalClicks: Number(c.advertiser.totalClicks),
      },
    }));

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = campaignSchema.parse(body);

    const campaign = await prisma.adCampaign.create({
      data: {
        advertiserId: data.advertiserId,
        slotId: data.slotId,
        name: data.name,
        status: data.status || 'DRAFT',
        budget: data.budget,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetStates: data.targetStates || [],
        targetDevices: data.targetDevices || [],
        notes: data.notes,
      },
      include: { advertiser: true, slot: true },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}
