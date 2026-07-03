import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://khabar-cut.vercel.app';

interface ArticleRow {
  slug: string;
  published_at: string | null;
  // Supabase returns foreign key as array when using select with foreign table
  categories: Array<{ slug: string }> | null;
}

interface CategoryRow {
  slug: string;
  updated_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, published_at, categories:category_id(slug)')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(1000),
    supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true),
  ]);

  const homepage: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories as CategoryRow[] ?? []).map((cat) => ({
    url: `${siteUrl}/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles as ArticleRow[] ?? [])
    .filter((art) => Array.isArray(art.categories) && art.categories.length > 0 && art.categories[0]?.slug)
    .map((art) => ({
      url: `${siteUrl}/${(art.categories as Array<{ slug: string }>)[0].slug}/${art.slug}`,
      lastModified: art.published_at ? new Date(art.published_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...homepage, ...categoryPages, ...articlePages];
}
