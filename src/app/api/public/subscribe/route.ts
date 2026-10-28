// =============================================================================
// POST /api/public/subscribe — Initiate subscription checkout via Razorpay
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    const supabase = createAdminClient();

    // Fetch plan
    const { data: plan, error: planErr } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', data.planId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (planErr || !plan) {
      return NextResponse.json({ success: false, error: 'Plan not found or inactive' }, { status: 404 });
    }

    const price = Number(plan.price);
    const amountInPaise = Math.round(price * 100);
    const receipt = `sub_${data.userId.slice(0, 8)}_${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: plan.currency || 'INR',
      receipt,
      notes: {
        planId: plan.id,
        planName: plan.name,
        userId: data.userId,
        billingCycle: plan.billing_cycle || plan.billingCycle,
      },
    });

    // Create pending payment record
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        user_id: data.userId,
        amount: price,
        currency: plan.currency || 'INR',
        status: 'PENDING',
        payment_for: 'SUBSCRIPTION',
        reference_id: plan.id,
        gateway_order_id: razorpayOrder.id,
        gst_rate: 18,
        gst_amount: price * 0.18,
        notes: `Subscription: ${plan.name}`,
      })
      .select('*')
      .single();

    if (payErr) {
      return NextResponse.json({ success: false, error: payErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        paymentId: payment.id,
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        keyId: getRazorpayPublicKey(),
        plan: {
          name: plan.name,
          billingCycle: plan.billing_cycle || plan.billingCycle,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Subscription checkout error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initiate checkout' }, { status: 500 });
  }
}
