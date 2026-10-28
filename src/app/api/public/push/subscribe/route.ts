// =============================================================================
// /api/public/push/subscribe — Browser push subscription registration (Supabase)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const adminSupabase = createAdminClient();

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userId: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = subscribeSchema.parse(body);
    const now = new Date().toISOString();

    // Check if endpoint exists
    const { data: existing } = await adminSupabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', data.endpoint)
      .maybeSingle();

    let subscriptionId: string;

    if (existing) {
      subscriptionId = existing.id;
      await adminSupabase
        .from('push_subscriptions')
        .update({
          p256dh: data.p256dh,
          auth: data.auth,
          user_id: data.userId || null,
          is_active: true,
          updated_at: now,
        })
        .eq('id', existing.id);
    } else {
      subscriptionId = crypto.randomUUID();
      const { error: insertError } = await adminSupabase
        .from('push_subscriptions')
        .insert({
          id: subscriptionId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          user_id: data.userId || null,
          device_type: data.deviceType || null,
          browser: data.browser || null,
          country: data.country || null,
          state: data.state || null,
          is_active: true,
          subscribed_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error('Supabase push subscribe error:', insertError);
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: { id: subscriptionId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Push subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = body.endpoint as string;
    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'Endpoint required' }, { status: 400 });
    }

    await adminSupabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
