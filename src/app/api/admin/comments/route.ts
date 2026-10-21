import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = (searchParams.get('status') || 'pending').toUpperCase();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const { data, count, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      status,
      created_at,
      user:users!user_id(full_name, email),
      article:articles!article_id(title, slug)
    `, { count: 'exact' })
    .eq('status', statusParam)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error('[Admin Comments API] Error:', error);
    return NextResponse.json({ data: [], count: 0 });
  }

  // Format response for admin frontend
  const formatted = (data ?? []).map((c: any) => ({
    id: c.id,
    body: c.content,
    status: c.status?.toLowerCase(),
    created_at: c.created_at,
    author_name: c.user?.full_name || 'पाठक (Guest)',
    author_email: c.user?.email || 'reader@khabarcut.in',
    article: c.article,
  }));

  return NextResponse.json({ data: formatted, count: count ?? 0 });
}

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();
  const upperStatus = (status || 'APPROVED').toUpperCase();
  const { error } = await supabase
    .from('comments')
    .update({ status: upperStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
