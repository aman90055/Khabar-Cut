import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

const BASE_URL = 'https://khabarcut.in';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at, category:categories!category_id(slug)')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(5000);

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true);

  // Fetch states
  const { data: states } = await supabase
    .from('states')
    .select('slug')
    .eq('is_active', true);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/editorial-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/correction-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/grievance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/states`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/videos`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/web-stories`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
  ];

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a: any) => ({
    url: `${BASE_URL}/${a.category?.slug || 'national'}/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(a.published_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => ({
    url: `${BASE_URL}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  const statePages: MetadataRoute.Sitemap = (states ?? []).map((s: any) => ({
    url: `${BASE_URL}/states/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...statePages, ...articlePages];
}
