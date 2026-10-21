import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const adminSupabase = createAdminClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: blog, error: blogError } = await adminSupabase
      .from('live_blogs')
      .select('*, author:authors!author_id(display_name)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (blogError || !blog) {
      return NextResponse.json({ error: 'Live blog not found' }, { status: 404 });
    }

    const { data: entries } = await adminSupabase
      .from('live_blog_entries')
      .select('*')
      .eq('live_blog_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      blog,
      entries: entries || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
