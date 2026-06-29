// =============================================================================
// /api/admin/subscriptions/plans — CRUD for subscription plans
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    // Get subscriber counts per plan
    const subscriberCounts = await prisma.userSubscription.groupBy({
      by: ['planId'],
      where: { status: 'ACTIVE' },
      _count: true,
    });

    const countMap = new Map(subscriberCounts.map((s) => [s.planId, s._count]));

    const plansWithStats = plans.map((plan) => ({
      ...plan,
      price: Number(plan.price),
      subscriberCount: countMap.get(plan.id) || 0,
      mrr: calculatePlanMrr(Number(plan.price), plan.billingCycle, countMap.get(plan.id) || 0),
    }));

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

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        currency: data.currency,
        billingCycle: data.billingCycle,
        trialDays: data.trialDays,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        features: data.features,
        adFree: data.adFree,
        exclusiveContent: data.exclusiveContent,
        premiumVideos: data.premiumVideos,
        premiumNewsletter: data.premiumNewsletter,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create plan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create plan' }, { status: 500 });
  }
}

function calculatePlanMrr(price: number, cycle: string, count: number): number {
  switch (cycle) {
    case 'MONTHLY': return price * count;
    case 'QUARTERLY': return (price / 3) * count;
    case 'ANNUAL': return (price / 12) * count;
    default: return 0;
  }
}
