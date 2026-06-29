// =============================================================================
// /api/admin/press-releases — Press Release workflow
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const pressReleaseSchema = z.object({
  title: z.string().min(1),
  content: z.record(z.unknown()),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  price: z.number().min(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
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

    const [releases, total] = await Promise.all([
      prisma.pressRelease.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pressRelease.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: releases.map((r) => ({ ...r, price: Number(r.price) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get press releases error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch press releases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pressReleaseSchema.parse(body);

    const release = await prisma.pressRelease.create({
      data: {
        ...data,
        content: data.content as any,
        mediaUrls: data.mediaUrls || [],
        status: 'PAYMENT_PENDING',
      },
    });


    return NextResponse.json({ success: true, data: release }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create press release error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create press release' }, { status: 500 });
  }
}
