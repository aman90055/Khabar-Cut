// =============================================================================
// /api/admin/affiliates — Affiliate system
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'KC';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const affiliateSchema = z.object({
  userId: z.string().min(1),
  commissionRate: z.number().min(0).max(100).default(10),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [affiliates, total] = await Promise.all([
      prisma.affiliateProfile.findMany({
        where: { deletedAt: null },
        include: {
          _count: { select: { conversions: true, withdrawals: true } },
        },
        orderBy: { totalEarned: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateProfile.count({ where: { deletedAt: null } }),
    ]);

    const data = affiliates.map((a) => ({
      ...a,
      commissionRate: Number(a.commissionRate),
      totalEarned: Number(a.totalEarned),
      totalPaid: Number(a.totalPaid),
      pendingBalance: Number(a.pendingBalance),
      conversionCount: a._count.conversions,
      withdrawalCount: a._count.withdrawals,
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
    console.error('Get affiliates error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = affiliateSchema.parse(body);

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.affiliateProfile.findUnique({ where: { referralCode } });
      if (!existing) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    const affiliate = await prisma.affiliateProfile.create({
      data: { ...data, referralCode },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...affiliate,
        commissionRate: Number(affiliate.commissionRate),
        totalEarned: Number(affiliate.totalEarned),
        totalPaid: Number(affiliate.totalPaid),
        pendingBalance: Number(affiliate.pendingBalance),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create affiliate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create affiliate' }, { status: 500 });
  }
}
