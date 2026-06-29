// =============================================================================
// /api/public/push/subscribe — Browser push subscription registration
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: {
        p256dh: data.p256dh,
        auth: data.auth,
        userId: data.userId,
        isActive: true,
      },
      create: {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userId: data.userId,
        deviceType: data.deviceType,
        browser: data.browser,
        country: data.country,
        state: data.state,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: { id: subscription.id } });
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

    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false, deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
