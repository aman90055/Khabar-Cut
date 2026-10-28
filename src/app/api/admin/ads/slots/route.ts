// =============================================================================
// /api/admin/ads/slots — Ad Slot configuration
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const slotSchema = z.object({
  name: z.string().min(1),
  position: z.string(),
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isActive: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  pricePerDay: z.number().optional(),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  networkCode: z.string().optional(),
  networkProvider: z.string().optional(),
});

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: slots, error } = await supabase
      .from('ad_slots')
      .select('*, campaigns:ad_campaigns(id)')
      .is('deleted_at', null);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = (slots || []).map((slot: any) => ({
      id: slot.id,
      name: slot.name,
      position: slot.position,
      description: slot.description,
      width: slot.width,
      height: slot.height,
      isActive: slot.is_active,
      isPremium: slot.is_premium,
      pricePerDay: slot.price_per_day ? Number(slot.price_per_day) : null,
      pricePerWeek: slot.price_per_week ? Number(slot.price_per_week) : null,
      pricePerMonth: slot.price_per_month ? Number(slot.price_per_month) : null,
      networkCode: slot.network_code,
      networkProvider: slot.network_provider,
      fillRate: slot.fill_rate ? Number(slot.fill_rate) : null,
      avgCtr: slot.avg_ctr ? Number(slot.avg_ctr) : null,
      avgCpm: slot.avg_cpm ? Number(slot.avg_cpm) : null,
      activeCampaigns: Array.isArray(slot.campaigns) ? slot.campaigns.length : 0,
      createdAt: slot.created_at,
      updatedAt: slot.updated_at,
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
    const supabase = createAdminClient();

    const { data: slot, error } = await supabase
      .from('ad_slots')
      .insert({
        name: data.name,
        position: data.position,
        description: data.description || null,
        width: data.width || null,
        height: data.height || null,
        is_active: data.isActive,
        is_premium: data.isPremium,
        price_per_day: data.pricePerDay || null,
        price_per_week: data.pricePerWeek || null,
        price_per_month: data.pricePerMonth || null,
        network_code: data.networkCode || null,
        network_provider: data.networkProvider || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create slot error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ad slot' }, { status: 500 });
  }
}
