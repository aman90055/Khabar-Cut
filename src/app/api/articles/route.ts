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

    // Matches our 25-table schema exactly
    let query = supabase
      .from('articles')
      .select(
        `
        id, title, slug, excerpt, status,
        published_at, created_at, views:view_count,
        is_featured, is_breaking,
        category:categories!category_id ( name, slug ),
        author:users!author_id ( display_name:full_name )
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status && status !== 'ALL') {
      const mappedStatus = status.toUpperCase();
      query = query.eq('status', mappedStatus);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: articles, count, error } = await query;

    if (error) {
      console.error('[API] Articles fetch error:', error.message);
      return NextResponse.json({ data: [], meta: { total: 0, page, pageSize, totalPages: 0 } });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: articles ?? [],
      meta: { total, page, pageSize, totalPages },
    });
  } catch (err) {
    console.error('[API] Articles route error:', err);
    return NextResponse.json({ data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title, slug, short_description, excerpt, content,
      category_id, status, is_featured, is_breaking, is_trending,
      author_id, seo_title, seo_description, tags,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Auto-generate slug from Hindi/English title
    const articleSlug = slug ||
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100);

    const articleStatus = status || 'draft';

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug: articleSlug,
        short_description: short_description || excerpt || null,
        excerpt: excerpt || null,
        content: content || '',
        category_id: category_id || null,
        author_id: author_id || null,
        status: articleStatus,
        is_featured: is_featured || false,
        is_breaking: is_breaking || false,
        is_trending: is_trending || false,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        published_at: articleStatus === 'published' ? new Date().toISOString() : null,
        visibility: 'public',
        views: 0,
        likes: 0,
        shares: 0,
        comments_count: 0,
        reading_time: Math.max(1, Math.ceil((content?.length || 0) / 1500)),
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Article create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0 && article) {
      const tagRows = tags.map((tagId: string) => ({
        article_id: article.id,
        tag_id: tagId,
      }));
      await supabase.from('article_tags').insert(tagRows);
    }

    return NextResponse.json({ data: article, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
