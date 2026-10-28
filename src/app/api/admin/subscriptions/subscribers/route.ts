// =============================================================================
// /api/admin/subscriptions/subscribers — List all subscribers
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const planId = searchParams.get('planId');
    const skip = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans!plan_id(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) query = query.eq('status', status);
    if (planId) query = query.eq('plan_id', planId);

    const { data: subscriptions, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = (subscriptions || []).map((sub: any) => ({
      id: sub.id,
      userId: sub.user_id,
      planId: sub.plan_id,
      status: sub.status,
      startDate: sub.start_date,
      endDate: sub.end_date,
      trialEndDate: sub.trial_end_date,
      autoRenew: sub.auto_renew,
      razorpaySubscriptionId: sub.razorpay_subscription_id,
      cashfreeSubscriptionId: sub.cashfree_subscription_id,
      cancelledAt: sub.cancelled_at,
      cancelReason: sub.cancel_reason,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
      plan: sub.plan
        ? {
            id: sub.plan.id,
            name: sub.plan.name,
            slug: sub.plan.slug,
            price: Number(sub.plan.price),
            billingCycle: sub.plan.billing_cycle || sub.plan.billingCycle,
          }
        : null,
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
    console.error('Get subscribers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
