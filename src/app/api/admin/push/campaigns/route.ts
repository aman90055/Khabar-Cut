// =============================================================================
// /api/admin/push/campaigns — Push notification campaigns
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const campaignSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  iconUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  clickUrl: z.string().url().optional(),
  targetAudience: z.enum(['all', 'subscribers', 'states']).default('all'),
  targetStates: z.array(z.string()).optional(),
  targetDevices: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('push_campaigns')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const [campaignRes, subRes] = await Promise.all([
      query,
      supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const campaigns = campaignRes.data || [];
    const total = campaignRes.count || 0;
    const totalSubscribers = subRes.count || 0;

    return NextResponse.json({
      success: true,
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalSubscribers,
    });
  } catch (error) {
    console.error('Get push campaigns error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch push campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = campaignSchema.parse(body);
    const supabase = createAdminClient();

    const { data: campaign, error } = await supabase
      .from('push_campaigns')
      .insert({
        title: data.title,
        body: data.body,
        icon_url: data.iconUrl || null,
        image_url: data.imageUrl || null,
        click_url: data.clickUrl || null,
        target_audience: data.targetAudience,
        target_states: data.targetStates || [],
        target_devices: data.targetDevices || [],
        scheduled_at: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
