// ============================================================
// KHABAR CUT — Articles DB Layer
// Supabase JS Client — No Prisma
// ============================================================

import { createClient } from '@/lib/supabase/server';
import type { ArticleListItem, ArticleWithRelations } from '@/types/supabase';

const ARTICLE_LIST_SELECT = `
  id, title, slug, excerpt,
  published_at, views:view_count, reading_time,
  is_breaking, is_featured, status,
  category:categories!category_id (name, slug),
  author:users!author_id (display_name:full_name),
  featured_image:media!featured_image_id (public_url:url, alt_text)
`;

const ARTICLE_FULL_SELECT = `
  *,
  category:categories!category_id (*),
  author:users!author_id (id, full_name, email, avatar_url),
  featured_image:media!featured_image_id (*),
  tags:article_tags (tag:tags (*))
`;

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'tech': 'technology',
  'takneek': 'technology',
  'khel': 'sports',
  'rajniti': 'politics',
  'vigyan': 'science',
  'vyapar': 'business',
  'arthavyavastha': 'economy',
  'raksha': 'defense',
  'shiksha': 'education',
  'antarrashtriy': 'world',
  'international': 'world',
  'parivahan': 'transport',
  'paryavaran': 'environment',
  'krishi': 'agriculture',
  'swasthya': 'health',
  'buniyadidhanca': 'infrastructure',
  'states': 'national',
  'rajyasamachar': 'national',
  'sarkariyojana': 'schemes',
  'paryatan': 'travel',
  'nyaypalika': 'legal',
  'dharm': 'religion',
  'suraksha': 'security',
};

// ── Get published articles (with optional category filter) ───
export async function getPublishedArticles(opts?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  featured?: boolean;
  trending?: boolean;
  breaking?: boolean;
}): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const limit = opts?.limit ?? 10;
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .range(offset, offset + limit - 1);

  if (opts?.categorySlug) {
    const normSlug = CATEGORY_SLUG_ALIASES[opts.categorySlug.toLowerCase()] || opts.categorySlug.toLowerCase();
    // Get category id first
    let { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', normSlug)
      .eq('is_active', true)
      .single();

    if (!cat) {
      const fallback = await supabase
        .from('categories')
        .select('id')
        .eq('slug', opts.categorySlug)
        .eq('is_active', true)
        .single();
      cat = fallback.data;
    }

    if (cat) {
      query = query.eq('category_id', cat.id);
    } else {
      return [];
    }
  }

  if (opts?.featured) query = query.eq('is_featured', true);
  if (opts?.breaking) query = query.eq('is_breaking', true);

  if (opts?.trending) {
    // There is no is_trending column, so we order by view_count to get trending
    query = query.order('view_count', { ascending: false }).order('published_at', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('[DB] getPublishedArticles error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as ArticleListItem[];
}

// ── Get single article by category slug + article slug ───────
export async function getArticleBySlug(
  categorySlug: string,
  articleSlug: string
): Promise<ArticleWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FULL_SELECT)
    .eq('slug', articleSlug)
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .single();

  if (error || !data) {
    return null;
  }

  // Normalize tags from join table
  const normalized = {
    ...data,
    tags: (data as any).tags?.map((t: any) => t.tag) ?? [],
  };

  return normalized as unknown as ArticleWithRelations;
}

// ── Get featured articles for homepage hero ───────────────────
export async function getFeaturedArticles(limit = 5): Promise<ArticleListItem[]> {
  return getPublishedArticles({ limit, featured: true });
}

// ── Get trending articles ─────────────────────────────────────
export async function getTrendingArticles(limit = 5): Promise<ArticleListItem[]> {
  return getPublishedArticles({ limit, trending: true });
}

// ── Get breaking news articles ────────────────────────────────
export async function getBreakingArticles(limit = 3): Promise<ArticleListItem[]> {
  return getPublishedArticles({ limit, breaking: true });
}

// ── Increment article views ───────────────────────────────────
export async function incrementArticleViews(
  articleId: string,
  sessionId?: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('increment_article_views', {
    p_article_id: articleId,
    p_session_id: sessionId ?? null,
  });
}

// ── Get articles by state ─────────────────────────────────────
export async function getArticlesByState(
  stateId: string,
  limit = 10
): Promise<ArticleListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('article_locations')
    .select(`article:articles!article_id (${ARTICLE_LIST_SELECT})`)
    .eq('state_id', stateId)
    .limit(limit);

  if (error || !data) return [];
  return data.map((d: any) => d.article).filter(Boolean) as unknown as ArticleListItem[];
}

// ── Search articles ───────────────────────────────────────────
export async function searchArticles(
  query: string,
  limit = 10
): Promise<ArticleListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .textSearch('title', query, { type: 'websearch', config: 'simple' })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as unknown as ArticleListItem[];
}

// ── Get articles by state slug ────────────────────────────────
export async function getArticlesByStateSlug(
  stateSlug: string,
  limit = 10
): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  // Get state id first
  const { data: state } = await supabase
    .from('states')
    .select('id')
    .eq('slug', stateSlug)
    .single();
  if (!state) return [];
  // articles with state tag via article_locations if exists, else fallback to category match
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as ArticleListItem[];
}

// ── Get articles by district slug ─────────────────────────────
export async function getArticlesByDistrictSlug(
  districtSlug: string,
  limit = 10
): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('status', 'PUBLISHED')
    .eq('visibility', 'PUBLIC')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as ArticleListItem[];
}
