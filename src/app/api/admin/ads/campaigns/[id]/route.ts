// =============================================================================
// /api/admin/ads/campaigns/[id] — Update / Delete Campaign
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    const supabase = createAdminClient();

    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .select('*, advertiser:advertisers!advertiser_id(*), slot:ad_slots!slot_id(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        advertiserId: campaign.advertiser_id,
        slotId: campaign.slot_id,
        name: campaign.name,
        status: campaign.status,
        budget: Number(campaign.budget),
        spent: Number(campaign.spent),
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        targetStates: campaign.target_states,
        targetDevices: campaign.target_devices,
        impressions: Number(campaign.impressions || 0),
        clicks: Number(campaign.clicks || 0),
        advertiser: campaign.advertiser,
        slot: campaign.slot,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
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
    const supabase = createAdminClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.startDate !== undefined) updateData.start_date = new Date(data.startDate).toISOString();
    if (data.endDate !== undefined) updateData.end_date = new Date(data.endDate).toISOString();
    if (data.targetStates !== undefined) updateData.target_states = data.targetStates;
    if (data.targetDevices !== undefined) updateData.target_devices = data.targetDevices;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.rejectedReason !== undefined) updateData.rejected_reason = data.rejectedReason;

    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .update(updateData)
      .eq('id', id)
      .select('*, advertiser:advertisers!advertiser_id(*), slot:ad_slots!slot_id(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

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
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('ad_campaigns')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'CANCELLED',
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Campaign cancelled and deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete campaign' }, { status: 500 });
  }
}
