import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const { data, count, error } = await supabase
    .from('comments')
    .select('id, body, status, created_at, author_name, author_email, article:articles!article_id(title, slug)', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return NextResponse.json({ data: [], count: 0 });
  return NextResponse.json({ data: data ?? [], count: count ?? 0 });
}

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();
  const { error } = await supabase.from('comments').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
