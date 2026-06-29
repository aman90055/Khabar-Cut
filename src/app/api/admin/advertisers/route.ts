// =============================================================================
// /api/admin/advertisers — Advertiser management
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const advertiserSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  logoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [advertisers, total] = await Promise.all([
      prisma.advertiser.findMany({
        where,
        include: {
          _count: { select: { campaigns: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.advertiser.count({ where }),
    ]);

    const data = advertisers.map((adv) => ({
      ...adv,
      totalSpend: Number(adv.totalSpend),
      totalImpressions: Number(adv.totalImpressions),
      totalClicks: Number(adv.totalClicks),
      campaignCount: adv._count.campaigns,
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
    console.error('Get advertisers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch advertisers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = advertiserSchema.parse(body);

    const advertiser = await prisma.advertiser.create({ data });
    return NextResponse.json({ success: true, data: advertiser }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create advertiser' }, { status: 500 });
  }
}
