import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [
      { count: totalArticles },
      { count: publishedArticles },
      { count: draftArticles },
      { count: totalUsers },
      { data: recentArticles },
      { data: topAuthors },
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED').is('deleted_at', null),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT').is('deleted_at', null),
      supabase.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('articles')
        .select(`id, title, slug, status, published_at, created_at, view_count, categories:category_id(name), author:author_id(full_name)`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('users')
        .select(`id, full_name, email, avatar_url, role:role_id(name, slug)`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return NextResponse.json({
      stats: {
        totalArticles: totalArticles ?? 0,
        publishedArticles: publishedArticles ?? 0,
        draftArticles: draftArticles ?? 0,
        totalUsers: totalUsers ?? 0,
      },
      recentArticles: recentArticles ?? [],
      topAuthors: topAuthors ?? [],
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({
      stats: { totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalUsers: 0 },
      recentArticles: [],
      topAuthors: [],
    });
  }
}
