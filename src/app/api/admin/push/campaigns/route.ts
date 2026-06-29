// =============================================================================
// /api/admin/push/campaigns — Push notification campaigns
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const campaignSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  iconUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  clickUrl: z.string().url().optional(),
  targetAudience: z.enum(['all', 'subscribers', 'states']).default('all'),
  targetStates: z.array(z.string()).optional(),
  targetDevices: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.pushCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pushCampaign.count({ where }),
    ]);

    // Subscriber stats
    const totalSubscribers = await prisma.pushSubscription.count({ where: { isActive: true } });

    return NextResponse.json({
      success: true,
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalSubscribers,
    });
  } catch (error) {
    console.error('Get push campaigns error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch push campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = campaignSchema.parse(body);

    const campaign = await prisma.pushCampaign.create({
      data: {
        ...data,
        targetStates: data.targetStates || [],
        targetDevices: data.targetDevices || [],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create push campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}
