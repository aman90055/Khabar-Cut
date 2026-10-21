import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: Request) {
  const { data: breakingNews, error } = await supabase
    .from('breaking_news')
    .select('id, article_id, title, priority, is_active, expires_at, created_at, article:articles!article_id(id, title, slug)')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Format for frontend backward compatibility
  const formatted = (breakingNews ?? []).map((b: any) => ({
    ...b,
    headline: b.title,
    end_at: b.expires_at,
  }));

  return NextResponse.json({ data: formatted });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = body.title || body.headline;
    if (!title) {
      return NextResponse.json({ error: 'Title / headline is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('breaking_news')
      .insert([
        {
          id: crypto.randomUUID(),
          article_id: body.article_id || null,
          title,
          priority: body.priority || 1,
          is_active: body.is_active ?? true,
          expires_at: body.expires_at || body.end_at || null,
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { ...data, headline: data.title } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.is_active === 'boolean') updatePayload.is_active = body.is_active;
    if (body.title || body.headline) updatePayload.title = body.title || body.headline;
    if (body.priority) updatePayload.priority = body.priority;

    const { data, error } = await supabase
      .from('breaking_news')
      .update(updatePayload)
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { ...data, headline: data?.title } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const { error } = await supabase
    .from('breaking_news')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
