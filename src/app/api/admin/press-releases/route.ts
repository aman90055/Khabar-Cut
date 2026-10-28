// =============================================================================
// /api/admin/press-releases — Press Release workflow
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const pressReleaseSchema = z.object({
  title: z.string().min(1),
  content: z.record(z.unknown()),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  price: z.number().min(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
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
      .from('press_releases')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: releases, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = count || 0;

    return NextResponse.json({
      success: true,
      data: (releases || []).map((r: any) => ({
        ...r,
        companyName: r.company_name,
        contactName: r.contact_name,
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone,
        mediaUrls: r.media_urls,
        price: Number(r.price),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get press releases error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch press releases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pressReleaseSchema.parse(body);
    const supabase = createAdminClient();

    const { data: release, error } = await supabase
      .from('press_releases')
      .insert({
        title: data.title,
        content: data.content,
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        media_urls: data.mediaUrls || [],
        price: data.price,
        seo_title: data.seoTitle || null,
        seo_description: data.seoDescription || null,
        status: 'PAYMENT_PENDING',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: release }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create press release error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create press release' }, { status: 500 });
  }
}
