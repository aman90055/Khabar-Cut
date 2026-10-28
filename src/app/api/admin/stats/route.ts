import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run all counts and aggregations in parallel
    const [
      { count: totalArticles },
      { count: publishedArticles },
      { count: draftArticles },
      { count: reviewArticles },
      { count: scheduledArticles },
      { count: breakingActive },
      { data: topArticles },
      { data: recentArticles },
      { data: viewsData },
      { count: todayArticles },
    ] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'DRAFT'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'REVIEW'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'SCHEDULED'),
      supabase.from('breaking_news').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('articles').select('id, title, slug, views:view_count, category:categories!category_id(name, slug)').eq('status', 'PUBLISHED').order('view_count', { ascending: false }).limit(5),
      supabase.from('articles').select('id, title, slug, status, published_at, created_at, views:view_count, category:categories!category_id(name, slug), author:users!author_id(display_name:full_name)').order('created_at', { ascending: false }).limit(8),
      supabase.from('articles').select('view_count').eq('status', 'PUBLISHED'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    ]);

    // Total views sum
    const totalViews = viewsData?.reduce((sum, a: any) => sum + (a.view_count || 0), 0) ?? 0;

    return NextResponse.json({
      stats: {
        totalArticles: totalArticles ?? 0,
        publishedArticles: publishedArticles ?? 0,
        draftArticles: draftArticles ?? 0,
        reviewArticles: reviewArticles ?? 0,
        scheduledArticles: scheduledArticles ?? 0,
        breakingActive: breakingActive ?? 0,
        totalViews,
        todayArticles: todayArticles ?? 0,
      },
      topArticles: topArticles ?? [],
      recentArticles: recentArticles ?? [],
    });
  } catch (err) {
    console.error('[Stats API]', err);
    return NextResponse.json({ stats: {}, topArticles: [], recentArticles: [] });
  }
}
