import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, Sparkles, Award } from 'lucide-react';
import { SidebarAd } from '@/components/ads/google-ad';
import { getCategoryBySlug } from '@/lib/db/categories';
import { getPublishedArticles } from '@/lib/db/articles';
import { ARTICLES_DATA } from '@/data/news-articles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_NAMES: Record<string, string> = {
  national: 'भारत (National)',
  technology: 'टेक्नोलॉजी (Tech)',
  business: 'बिज़नेस (Business)',
  world: 'विश्व (World)',
  sports: 'स्पोर्ट्स (Sports)',
  entertainment: 'मनोरंजन (Entertainment)',
  states: 'राज्य (States)',
  jharkhand: 'झारखंड',
  bihar: 'बिहार',
  politics: 'राजनीति',
  education: 'शिक्षा',
  international: 'अंतरराष्ट्रीय',
};

function imgUrl(article: any): string {
  return (
    article.featured_image?.public_url ||
    article.featuredImage?.url ||
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'
  );
}

function authorName(article: any): string {
  return article.author?.display_name || article.author?.fullName || 'खबर कट';
}

function pubDate(article: any): string {
  const d = article.published_at || article.publishedAt;
  if (!d) return '';
  return new Date(d).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' });
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  // Fetch category and articles from Supabase
  const [category, sbArticles] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getPublishedArticles({ categorySlug, limit: 12 }),
  ]);

  // Fallback to static data if DB empty
  const matchingFallback = ARTICLES_DATA.filter(
    (a: any) => a.category?.slug === categorySlug
  );
  const articles: any[] =
    sbArticles.length > 0
      ? sbArticles
      : matchingFallback.length > 0
      ? matchingFallback
      : ARTICLES_DATA.slice(0, 12);

  const categoryName =
    category?.name ||
    CATEGORY_NAMES[categorySlug] ||
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  if (articles.length === 0 && !category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10 py-6 sm:py-8 space-y-8">

      {/* Category Banner */}
      <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-[#D90429] font-black uppercase text-xs tracking-widest">
          <Sparkles className="w-4 h-4" />
          श्रेणी फ़ीड (Category Feed)
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight font-display">
          {categoryName}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl font-semibold leading-relaxed">
          {category?.description ||
            `${categoryName} की ताज़ा ख़बरें, विश्लेषण और विशेष रिपोर्ट यहाँ पढ़ें।`}
        </p>

        {/* Sub-category breadcrumb */}
        <div className="flex gap-2 overflow-x-auto pt-5 border-t border-gray-100 dark:border-white/5 mt-5 scrollbar-thin">
          {['ताज़ा समाचार', 'विशेष रिपोर्ट्स', 'विश्लेषण', 'ओपिनियन'].map((sub, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 whitespace-nowrap"
            >
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Articles List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article: any) => (
              <div key={article.id} className="kc-card overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="article-card-img aspect-video bg-gray-100 dark:bg-gray-800">
                    <img src={imgUrl(article)} alt={article.title} loading="lazy" />
                  </div>
                  <div className="p-5 space-y-2">
                    <h2 className="text-sm sm:text-base font-extrabold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/${categorySlug}/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {article.short_description || article.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 font-semibold mt-auto">
                  <span>लेखक: {authorName(article)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {pubDate(article)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <SidebarAd />

          {/* Editor's Picks */}
          <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
              <Award className="w-4 h-4 text-[#F6B100]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                संपादक की पसंद
              </span>
            </div>
            <div className="space-y-3">
              {articles.slice(0, 4).map((item: any) => (
                <div key={item.id} className="flex gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img src={imgUrl(item)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-extrabold text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/${categorySlug}/${item.slug}`}>{item.title}</Link>
                    </h4>
                    <p className="text-[9px] text-gray-400">{pubDate(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
