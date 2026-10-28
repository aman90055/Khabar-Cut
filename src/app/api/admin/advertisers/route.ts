// =============================================================================
// /api/admin/advertisers — Advertiser management
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const supabase = createAdminClient();

    let query = supabase
      .from('advertisers')
      .select('*, campaigns:ad_campaigns(id)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%,contact_name.ilike.%${search}%`);
    }

    const { data: advertisers, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = (advertisers || []).map((adv: any) => ({
      id: adv.id,
      companyName: adv.company_name,
      contactName: adv.contact_name,
      email: adv.email,
      phone: adv.phone,
      website: adv.website,
      gstNumber: adv.gst_number,
      panNumber: adv.pan_number,
      address: adv.address,
      city: adv.city,
      state: adv.state,
      pincode: adv.pincode,
      status: adv.status,
      totalSpend: Number(adv.total_spend || 0),
      totalImpressions: Number(adv.total_impressions || 0),
      totalClicks: Number(adv.total_clicks || 0),
      logoUrl: adv.logo_url,
      notes: adv.notes,
      activeCampaigns: Array.isArray(adv.campaigns) ? adv.campaigns.length : 0,
      createdAt: adv.created_at,
      updatedAt: adv.updated_at,
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
    console.error('Get advertisers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch advertisers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = advertiserSchema.parse(body);
    const supabase = createAdminClient();

    const { data: advertiser, error } = await supabase
      .from('advertisers')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        gst_number: data.gstNumber || null,
        pan_number: data.panNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        logo_url: data.logoUrl || null,
        notes: data.notes || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: advertiser }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create advertiser error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create advertiser' }, { status: 500 });
  }
}
