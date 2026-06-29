// =============================================================================
// /api/admin/ads/slots/[id] — Update Ad Slot
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  pricePerDay: z.number().optional(),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  networkCode: z.string().optional(),
  networkProvider: z.enum(['ADSENSE', 'ADSTERRA', 'MEDIA_NET', 'TABOOLA', 'OUTBRAIN', 'MGID', 'DIRECT']).optional(),
  fillRate: z.number().optional(),
  avgCtr: z.number().optional(),
  avgCpm: z.number().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const slot = await prisma.adSlot.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: slot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Update slot error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ad slot' }, { status: 500 });
  }
}
