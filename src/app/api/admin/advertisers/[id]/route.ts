// =============================================================================
// /api/admin/advertisers/[id] — Advertiser detail + status change
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED']).optional(),
  logoUrl: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const advertiser = await prisma.advertiser.findFirst({
      where: { id, deletedAt: null },
      include: {
        campaigns: {
          where: { deletedAt: null },
          include: { slot: true, creatives: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!advertiser) {
      return NextResponse.json({ success: false, error: 'Advertiser not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...advertiser,
        totalSpend: Number(advertiser.totalSpend),
        totalImpressions: Number(advertiser.totalImpressions),
        totalClicks: Number(advertiser.totalClicks),
      },
    });
  } catch (error) {
    console.error('Get advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch advertiser' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const advertiser = await prisma.advertiser.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: advertiser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Update advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update advertiser' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.advertiser.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, message: 'Advertiser deleted' });
  } catch (error) {
    console.error('Delete advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete advertiser' }, { status: 500 });
  }
}
