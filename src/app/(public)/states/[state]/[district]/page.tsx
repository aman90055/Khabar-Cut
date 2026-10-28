import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPublishedArticles } from '@/lib/db/articles';
import { MapPin, ChevronRight, Newspaper } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ state: string; district: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { state, district } = await params;
  const supabase = await createClient();
  const { data: dist } = await supabase
    .from('districts')
    .select('name, states!state_id(name, slug)')
    .eq('slug', district)
    .single();
  const distName = dist?.name || district;
  const stateName = (dist?.states as any)?.name || state;
  return {
    title: `${distName} समाचार | ${stateName} | Khabar Cut`,
    description: `${distName}, ${stateName} की ताज़ा खबरें और ब्रेकिंग न्यूज़।`,
  };
}

export default async function DistrictPage({ params }: Props) {
  const { state: stateSlug, district: districtSlug } = await params;
  const supabase = await createClient();

  // Get district with state info
  const { data: district } = await supabase
    .from('districts')
    .select('id, name, slug, state:states!state_id(id, name, slug)')
    .eq('slug', districtSlug)
    .single();

  if (!district) notFound();

  // Get articles (use general published articles for now)
  const articles = await getPublishedArticles({ limit: 12 });
  const stateData = district.state as any;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-[#D90429]">होम</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/states" className="hover:text-[#D90429]">राज्य</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/states/${stateData?.slug}`} className="hover:text-[#D90429]">{stateData?.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{district.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D90429] to-orange-500 flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{district.name} समाचार</h1>
            <p className="text-sm text-zinc-500">{stateData?.name} · ताज़ा खबरें</p>
          </div>
        </div>

        {/* Articles grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">अभी कोई खबर नहीं है</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => {
              const imgUrl = article.featured_image?.public_url || article.featuredImage?.url || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80`;
              const href = `/${article.category?.slug || 'national'}/${article.slug}`;
              return (
                <Link key={article.id} href={href} className="group block rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all">
                  <div className="aspect-video overflow-hidden">
                    <img src={imgUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#D90429] font-bold mb-1">{article.category?.name || district.name}</p>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-[#D90429] transition-colors">{article.title}</h2>
                    <p className="text-xs text-zinc-500 mt-2">
                      {article.author?.display_name || 'Khabar Cut'} · {article.published_at ? new Date(article.published_at).toLocaleDateString('hi-IN') : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
