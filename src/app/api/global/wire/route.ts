// =============================================================================
// /api/global/wire — Internal Wire Service Distribution Queue
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const wireQuerySchema = z.object({
  priority: z.enum(['URGENT', 'FLASH', 'UPDATE', 'CORRECTION', 'EXCLUSIVE', 'EMBARGO']).optional(),
  language: z.string().default('en'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const wireCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['URGENT', 'FLASH', 'UPDATE', 'CORRECTION', 'EXCLUSIVE', 'EMBARGO']).default('UPDATE'),
  source: z.string().default('internal'),
  language: z.string().default('en'),
  embargoUntil: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = wireQuerySchema.parse({
      priority: searchParams.get('priority') || undefined,
      language: searchParams.get('language') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    let query = supabase
      .from('wire_items')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .or(`embargo_until.is.null,embargo_until.lt.${now}`)
      .order('created_at', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.priority) {
      query = query.eq('priority', params.priority);
    }
    if (params.language) {
      query = query.eq('language', params.language);
    }

    const { data: items, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      priority: item.priority,
      source: item.source,
      language: item.language,
      embargoUntil: item.embargo_until,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      total: count || 0,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Fetch wire error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = wireCreateSchema.parse(body);
    const supabase = createAdminClient();

    const { data: wireItem, error } = await supabase
      .from('wire_items')
      .insert({
        title: data.title,
        content: data.content,
        priority: data.priority,
        source: data.source,
        language: data.language,
        embargo_until: data.embargoUntil ? new Date(data.embargoUntil).toISOString() : null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: wireItem,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create wire error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
