import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const rawPageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const pageSize = Math.min(100, Math.max(1, rawPageSize));
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    let query = supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, status, published_at, created_at, view_count,
        categories:category_id ( name, slug ),
        author:author_id ( full_name )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: articles, count, error } = await query;

    if (error) {
      console.error('Articles fetch error:', error.message);
      return NextResponse.json({ data: [], meta: { total: 0, page, pageSize, totalPages: 0 } });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: articles ?? [],
      meta: { total, page, pageSize, totalPages },
    });
  } catch (err) {
    console.error('Articles route error:', err);
    return NextResponse.json({ data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category_id, status, is_featured, is_breaking, author_id, meta_title, meta_description, tags } = body;

    if (!title || !category_id || !author_id) {
      return NextResponse.json({ error: 'Title, category, and author are required' }, { status: 400 });
    }

    const articleSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug: articleSlug,
        excerpt: excerpt || null,
        content: content || {},
        category_id,
        status: status || 'DRAFT',
        is_featured: is_featured || false,
        is_breaking: is_breaking || false,
        author_id,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
        view_count: 0,
        word_count: content ? JSON.stringify(content).split(' ').length : 0,
        reading_time: 1,
        visibility: 'PUBLIC',
        priority: 'NORMAL',
      })
      .select()
      .single();

    if (error) {
      console.error('Article create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: article, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
