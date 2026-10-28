import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: rawEntries, error } = await supabase
      .from('live_blog_entries')
      .select('id, live_blog_id, content, created_at')
      .eq('live_blog_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = (rawEntries || []).map((e: any) => ({
      id: e.id,
      content: typeof e.content === 'string' ? e.content : JSON.stringify(e.content),
      isPinned: false,
      entryType: 'STANDARD',
      createdAt: e.created_at,
      author: {
        displayName: 'खबर कट टीम',
      },
    }));

    return NextResponse.json({ entries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
