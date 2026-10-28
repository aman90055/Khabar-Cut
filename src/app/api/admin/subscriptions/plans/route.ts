// =============================================================================
// /api/admin/subscriptions/plans — CRUD for subscription plans
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const planSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'LIFETIME']),
  trialDays: z.number().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  features: z.array(z.string()),
  adFree: z.boolean().default(false),
  exclusiveContent: z.boolean().default(false),
  premiumVideos: z.boolean().default(false),
  premiumNewsletter: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

function calculatePlanMrr(price: number, billingCycle: string, count: number): number {
  let monthlyPrice = price;
  if (billingCycle === 'QUARTERLY') monthlyPrice = price / 3;
  if (billingCycle === 'ANNUAL') monthlyPrice = price / 12;
  if (billingCycle === 'LIFETIME') return 0;
  return Math.round(monthlyPrice * count * 100) / 100;
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [plansRes, subsRes] = await Promise.all([
      supabase
        .from('subscription_plans')
        .select('*')
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      supabase
        .from('user_subscriptions')
        .select('plan_id')
        .eq('status', 'ACTIVE')
        .is('deleted_at', null),
    ]);

    if (plansRes.error) {
      return NextResponse.json({ success: false, error: plansRes.error.message }, { status: 500 });
    }

    const countMap = new Map<string, number>();
    for (const sub of subsRes.data || []) {
      countMap.set(sub.plan_id, (countMap.get(sub.plan_id) || 0) + 1);
    }

    const plansWithStats = (plansRes.data || []).map((plan: any) => {
      const price = Number(plan.price);
      const cycle = plan.billing_cycle || plan.billingCycle;
      const count = countMap.get(plan.id) || 0;

      return {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price,
        currency: plan.currency,
        billingCycle: cycle,
        trialDays: plan.trial_days,
        isActive: plan.is_active,
        isFeatured: plan.is_featured,
        features: plan.features || [],
        adFree: plan.ad_free,
        exclusiveContent: plan.exclusive_content,
        premiumVideos: plan.premium_videos,
        premiumNewsletter: plan.premium_newsletter,
        sortOrder: plan.sort_order,
        subscriberCount: count,
        mrr: calculatePlanMrr(price, cycle, count),
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      };
    });

    return NextResponse.json({ success: true, data: plansWithStats });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = planSchema.parse(body);
    const supabase = createAdminClient();

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        currency: data.currency,
        billing_cycle: data.billingCycle,
        trial_days: data.trialDays,
        is_active: data.isActive,
        is_featured: data.isFeatured,
        features: data.features,
        ad_free: data.adFree,
        exclusive_content: data.exclusiveContent,
        premium_videos: data.premiumVideos,
        premium_newsletter: data.premiumNewsletter,
        sort_order: data.sortOrder,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create plan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create subscription plan' }, { status: 500 });
  }
}
