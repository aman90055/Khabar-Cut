// =============================================================================
// /api/admin/ads/campaigns — Ad Campaign CRUD
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const supabase = createAdminClient();

    let query = supabase
      .from('ad_campaigns')
      .select('*, advertiser:advertisers!advertiser_id(*), slot:ad_slots!slot_id(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) query = query.eq('status', status);
    if (advertiserId) query = query.eq('advertiser_id', advertiserId);

    const { data: campaigns, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = (campaigns || []).map((c: any) => ({
      id: c.id,
      advertiserId: c.advertiser_id,
      slotId: c.slot_id,
      name: c.name,
      status: c.status,
      budget: Number(c.budget),
      spent: Number(c.spent),
      startDate: c.start_date,
      endDate: c.end_date,
      targetStates: c.target_states,
      targetDevices: c.target_devices,
      impressions: Number(c.impressions || 0),
      clicks: Number(c.clicks || 0),
      conversions: Number(c.conversions || 0),
      ctr: c.ctr ? Number(c.ctr) : null,
      cpm: c.cpm ? Number(c.cpm) : null,
      advertiser: c.advertiser
        ? {
            id: c.advertiser.id,
            companyName: c.advertiser.company_name,
            contactName: c.advertiser.contact_name,
          }
        : null,
      slot: c.slot
        ? {
            id: c.slot.id,
            name: c.slot.name,
            position: c.slot.position,
          }
        : null,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
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
    const supabase = createAdminClient();

    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .insert({
        advertiser_id: data.advertiserId,
        slot_id: data.slotId || null,
        name: data.name,
        status: data.status || 'DRAFT',
        budget: data.budget,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString(),
        target_states: data.targetStates || [],
        target_devices: data.targetDevices || [],
      })
      .select('*, advertiser:advertisers!advertiser_id(*), slot:ad_slots!slot_id(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}
