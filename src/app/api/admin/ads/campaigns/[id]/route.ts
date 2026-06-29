// =============================================================================
// /api/admin/ads/campaigns/[id] — Update / Delete Campaign
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  budget: z.number().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targetStates: z.array(z.string()).optional(),
  targetDevices: z.array(z.string()).optional(),
  notes: z.string().optional(),
  rejectedReason: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const campaign = await prisma.adCampaign.findFirst({
      where: { id, deletedAt: null },
      include: {
        advertiser: true,
        slot: true,
        creatives: { where: { deletedAt: null } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        budget: Number(campaign.budget),
        spent: Number(campaign.spent),
        impressions: Number(campaign.impressions),
        clicks: Number(campaign.clicks),
      },
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status === 'ACTIVE' && !updateData.approvedAt) {
      updateData.approvedAt = new Date();
    }

    const campaign = await prisma.adCampaign.update({
      where: { id },
      data: updateData,
      include: { advertiser: true, slot: true },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Update campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.adCampaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true, message: 'Campaign cancelled and deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete campaign' }, { status: 500 });
  }
}
