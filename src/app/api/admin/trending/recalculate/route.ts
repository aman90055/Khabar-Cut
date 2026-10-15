import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Trending score algorithm:
// Score = (views * 1) + (recent_views_boost) + (likes * 5) + (shares * 10) + (comments * 3)
// Recent boost: articles published in last 24h get 2x, last 3 days get 1.5x, last week 1.2x

export async function POST() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all recent published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, views:view_count, likes, shares, comments_count, published_at')
      .eq('status', 'PUBLISHED')
      .gte('published_at', sevenDaysAgo);

    if (error || !articles) {
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    const now = Date.now();
    const updates: { id: string; is_trending: boolean }[] = [];
    const scores: { id: string; score: number }[] = [];

    for (const article of articles) {
      const pubDate = new Date(article.published_at || now).getTime();
      const hoursOld = (now - pubDate) / (1000 * 60 * 60);

      // Recency multiplier
      let recencyBoost = 1.0;
      if (hoursOld < 24) recencyBoost = 2.5;
      else if (hoursOld < 72) recencyBoost = 1.8;
      else if (hoursOld < 168) recencyBoost = 1.3;

      const score = Math.round(
        ((article.views || 0) * 1 +
         (article.likes || 0) * 5 +
         (article.shares || 0) * 10 +
         (article.comments_count || 0) * 3) * recencyBoost
      );

      scores.push({ id: article.id, score });
    }

    // Sort by score, top 10 are trending
    scores.sort((a, b) => b.score - a.score);
    const trendingIds = new Set(scores.slice(0, 10).map(s => s.id));

    // First reset all trending
    await supabase.from('articles').update({ is_trending: false }).eq('status', 'PUBLISHED');

    // Set top 10 as trending
    if (trendingIds.size > 0) {
      await supabase.from('articles').update({ is_trending: true }).in('id', [...trendingIds]);
    }

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
  // Return current trending articles
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, views:view_count, likes, shares, comments_count, published_at')
    .eq('status', 'PUBLISHED')
    .eq('is_trending', true)
    .order('view_count', { ascending: false })
    .limit(10);

  return NextResponse.json({ data: data ?? [] });
}
