import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

export const revalidate = 300; // 5 minutes

export async function GET() {
  // Google News sitemap: articles from last 48 hours, or latest 50 articles if none in 48 hours
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  let { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, published_at, category:categories!category_id(name, slug)')
    .eq('status', 'PUBLISHED')
    .gte('published_at', twoDaysAgo)
    .order('published_at', { ascending: false })
    .limit(1000);

  if (!articles || articles.length === 0) {
    const { data: latest } = await supabase
      .from('articles')
      .select('id, title, slug, published_at, category:categories!category_id(name, slug)')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(50);
    articles = latest;
  }

  const baseUrl = 'https://khabarcut.in';

  let urls = (articles ?? []).map((article: any) => {
    const categorySlug = article.category?.slug || 'national';
    const articleUrl = `${baseUrl}/${categorySlug}/${article.slug}`;
    const pubDate = article.published_at
      ? new Date(article.published_at).toISOString()
      : new Date().toISOString();

    return `
  <url>
    <loc>${articleUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Khabar Cut</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
    </news:news>
    <lastmod>${pubDate}</lastmod>
  </url>`;
  }).join('');

  // Fallback to prevent Google Search Console "Missing XML tag" error when there are no recent articles
  if (!urls) {
    urls = `
  <url>
    <loc>${baseUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Khabar Cut</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${new Date().toISOString()}</news:publication_date>
      <news:title><![CDATA[Khabar Cut - Latest News]]></news:title>
    </news:news>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
