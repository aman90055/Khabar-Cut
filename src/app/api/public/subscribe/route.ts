// =============================================================================
// POST /api/public/subscribe — Initiate subscription checkout via Razorpay
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/payments/razorpay';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  planId: z.string().uuid(),
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Fetch plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: data.planId, isActive: true, deletedAt: null },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found or inactive' }, { status: 404 });
    }

    const amountInPaise = Math.round(Number(plan.price) * 100);
    const receipt = `sub_${data.userId.slice(0, 8)}_${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: plan.currency,
      receipt,
      notes: {
        planId: plan.id,
        planName: plan.name,
        userId: data.userId,
        billingCycle: plan.billingCycle,
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: data.userId,
        amount: Number(plan.price),
        currency: plan.currency,
        status: 'PENDING',
        paymentFor: 'SUBSCRIPTION',
        referenceId: plan.id,
        gatewayOrderId: razorpayOrder.id,
        gstRate: 18,
        gstAmount: Number(plan.price) * 0.18,
        notes: `Subscription: ${plan.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        paymentId: payment.id,
        amount: amountInPaise,
        currency: plan.currency,
        keyId: getRazorpayPublicKey(),
        plan: {
          name: plan.name,
          billingCycle: plan.billingCycle,
          price: Number(plan.price),
        },
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone || '',
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Subscribe checkout error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initiate checkout' }, { status: 500 });
  }
}
