// =============================================================================
// /api/admin/affiliates — Affiliate system
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'KC';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const affiliateSchema = z.object({
  userId: z.string().min(1),
  commissionRate: z.number().min(0).max(100).default(10),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data: affiliates, count, error } = await supabase
      .from('affiliate_profiles')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('total_earned', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = (affiliates || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      referralCode: a.referral_code,
      commissionRate: Number(a.commission_rate),
      totalEarned: Number(a.total_earned),
      totalPaid: Number(a.total_paid),
      pendingBalance: Number(a.pending_balance),
      bankName: a.bank_name,
      accountNumber: a.account_number,
      ifscCode: a.ifsc_code,
      upiId: a.upi_id,
      isActive: a.is_active,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
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
    console.error('Get affiliates error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = affiliateSchema.parse(body);
    const supabase = createAdminClient();

    let referralCode = generateReferralCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    const { data: affiliate, error } = await supabase
      .from('affiliate_profiles')
      .insert({
        user_id: data.userId,
        referral_code: referralCode,
        commission_rate: data.commissionRate,
        bank_name: data.bankName || null,
        account_number: data.accountNumber || null,
        ifsc_code: data.ifscCode || null,
        upi_id: data.upiId || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: affiliate }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create affiliate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create affiliate profile' }, { status: 500 });
  }
}
