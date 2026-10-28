// =============================================================================
// /api/admin/advertisers/[id] — Advertiser detail + status change
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    const supabase = createAdminClient();

    const { data: advertiser, error } = await supabase
      .from('advertisers')
      .select('*, campaigns:ad_campaigns(*, slot:ad_slots!slot_id(*))')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !advertiser) {
      return NextResponse.json({ success: false, error: 'Advertiser not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: advertiser.id,
        companyName: advertiser.company_name,
        contactName: advertiser.contact_name,
        email: advertiser.email,
        phone: advertiser.phone,
        website: advertiser.website,
        gstNumber: advertiser.gst_number,
        panNumber: advertiser.pan_number,
        address: advertiser.address,
        city: advertiser.city,
        state: advertiser.state,
        pincode: advertiser.pincode,
        status: advertiser.status,
        totalSpend: Number(advertiser.total_spend || 0),
        totalImpressions: Number(advertiser.total_impressions || 0),
        totalClicks: Number(advertiser.total_clicks || 0),
        logoUrl: advertiser.logo_url,
        notes: advertiser.notes,
        campaigns: advertiser.campaigns,
        createdAt: advertiser.created_at,
        updatedAt: advertiser.updated_at,
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
    const supabase = createAdminClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.companyName !== undefined) updateData.company_name = data.companyName;
    if (data.contactName !== undefined) updateData.contact_name = data.contactName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.gstNumber !== undefined) updateData.gst_number = data.gstNumber;
    if (data.panNumber !== undefined) updateData.pan_number = data.panNumber;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: advertiser, error } = await supabase
      .from('advertisers')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

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
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('advertisers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Advertiser deleted' });
  } catch (error) {
    console.error('Delete advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete advertiser' }, { status: 500 });
  }
}
