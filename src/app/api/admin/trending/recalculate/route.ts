import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Trending score algorithm:
// Score = (view_count * 1) * recent_boost
// Recent boost: articles published in last 24h get 2.5x, last 3 days get 1.8x, last week 1.3x

export async function POST() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all recent published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, views:view_count, published_at')
      .eq('status', 'PUBLISHED')
      .gte('published_at', sevenDaysAgo);

    if (error || !articles) {
      console.error('[Trending] Error fetching:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    const now = Date.now();
    const scores: { id: string; score: number }[] = [];

    for (const article of articles) {
      const pubDate = new Date(article.published_at || now).getTime();
      const hoursOld = (now - pubDate) / (1000 * 60 * 60);

      // Recency multiplier
      let recencyBoost = 1.0;
      if (hoursOld < 24) recencyBoost = 2.5;
      else if (hoursOld < 72) recencyBoost = 1.8;
      else if (hoursOld < 168) recencyBoost = 1.3;

      const score = Math.round((article.views || 0) * recencyBoost);
      scores.push({ id: article.id, score });
    }

    // Sort by score, top 10 are trending
    scores.sort((a, b) => b.score - a.score);
    const trendingIds = new Set(scores.slice(0, 10).map(s => s.id));

    return NextResponse.json({
      success: true,
      processed: articles.length,
      trending: trendingIds.size,
      topArticles: scores.slice(0, 5),
    });
  } catch (err) {
    console.error('[Trending] Error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  // Return top 10 articles by views
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, views:view_count, published_at, category:categories!category_id(name, slug)')
    .eq('status', 'PUBLISHED')
    .order('view_count', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ data: [] });
  }

  return NextResponse.json({ data: data ?? [] });
}
