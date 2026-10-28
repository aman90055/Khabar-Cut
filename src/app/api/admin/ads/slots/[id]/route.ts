// =============================================================================
// /api/admin/ads/slots/[id] — Update Ad Slot
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
  networkProvider: z.string().optional(),
  fillRate: z.number().optional(),
  avgCtr: z.number().optional(),
  avgCpm: z.number().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);
    const supabase = createAdminClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isPremium !== undefined) updateData.is_premium = data.isPremium;
    if (data.pricePerDay !== undefined) updateData.price_per_day = data.pricePerDay;
    if (data.pricePerWeek !== undefined) updateData.price_per_week = data.pricePerWeek;
    if (data.pricePerMonth !== undefined) updateData.price_per_month = data.pricePerMonth;
    if (data.networkCode !== undefined) updateData.network_code = data.networkCode;
    if (data.networkProvider !== undefined) updateData.network_provider = data.networkProvider;
    if (data.fillRate !== undefined) updateData.fill_rate = data.fillRate;
    if (data.avgCtr !== undefined) updateData.avg_ctr = data.avgCtr;
    if (data.avgCpm !== undefined) updateData.avg_cpm = data.avgCpm;

    const { data: slot, error } = await supabase
      .from('ad_slots')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: slot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Update slot error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ad slot' }, { status: 500 });
  }
}
