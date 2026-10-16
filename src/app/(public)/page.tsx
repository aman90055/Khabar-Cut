import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Eye, Play, Sparkles, TrendingUp, ChevronRight,
  Tv, Cpu, ShieldAlert, Newspaper, Bookmark, Share2, Mail, Flame, CheckCircle, Award
} from 'lucide-react';
import { MarketWidget } from '@/components/widgets/market-widget';
import { InteractivePoll } from '@/components/widgets/interactive-poll';
import { StateSelector } from '@/components/widgets/state-selector';
import { AIRecommendations } from '@/components/widgets/ai-recommendations';
import { SidebarAd, HeaderBannerAd } from '@/components/ads/google-ad';
import {
  getPublishedArticles,
  getTrendingArticles,
  getBreakingArticles,
} from '@/lib/db/articles';
import { getActiveBreakingNews } from '@/lib/db/breaking-news';
import type { ArticleListItem } from '@/types/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Fallback data for when DB is empty ───────────────────────
import { ARTICLES_DATA } from '@/data/news-articles';

// Helper: format article URL from supabase or fallback
function articleUrl(article: any): string {
  if (article.category?.slug && article.slug) {
    return `/${article.category.slug}/${article.slug}`;
  }
  // legacy fallback
  if (article.category?.slug) return `/article/${article.slug}`;
  return `/article/${article.slug}`;
}

// Helper: get featured image url from supabase or fallback data
function imgUrl(article: any): string {
  return (
    article.featured_image?.public_url ||
    article.featuredImage?.url ||
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
  );
}

function imgAlt(article: any): string {
  return article.featured_image?.alt_text || article.featuredImage?.altText || article.title;
}

function authorName(article: any): string {
  return article.author?.display_name || article.author?.fullName || 'खबर कट';
}

function pubDate(article: any): string {
  const d = article.published_at || article.publishedAt;
  if (!d) return '';
  return new Date(d).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' });
}

function viewCount(article: any): string | number {
  return article.views ?? article.viewCount ?? 0;
}

export default async function HomePage() {
  // ── Fetch from Supabase 25-table schema ─────────────────────
  const [sbArticles, sbTrending, sbBreaking, breakingNewsTicker] = await Promise.all([
    getPublishedArticles({ limit: 40 }),
    getTrendingArticles(8),
    getBreakingArticles(4),
    getActiveBreakingNews(),
  ]);

  // Use Supabase data if available, else fallback to static data
  const articles: any[] = sbArticles.length > 0 ? sbArticles : ARTICLES_DATA;
  const trendingArticles: any[] = sbTrending.length > 0 ? sbTrending : [];
  const featured = articles[0];
  const secondaryArticles = articles.slice(1, 13);

  // Trending list: use real DB data if available, else static mock
  const MOCK_TRENDING_FALLBACK = [
    { rank: '1', title: 'झारखंड में बड़ा आंदोलन, सड़कों पर उतरे छात्र', views: '' },
    { rank: '2', title: 'स्वतंत्रता दिवस पर PM का बड़ा ऐलान', views: '' },
    { rank: '3', title: 'Share Market में बड़ी गिरावट', views: '' },
    { rank: '4', title: 'झारखंड में नई शिक्षा नीति लागू', views: '' },
    { rank: '5', title: 'रांची में मेगा इंफ्रा प्रोजेक्ट की शुरुआत', views: '' },
  ];
  const trendingList = trendingArticles.length > 0
    ? trendingArticles.map((a, i) => ({
        rank: String(i + 1),
        title: a.title,
        views: a.views > 0 ? `${a.views.toLocaleString('hi-IN')} व्यूज़` : '',
        href: articleUrl(a),
      }))
    : MOCK_TRENDING_FALLBACK.map(t => ({ ...t, href: '/search' }));

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-12 bg-white dark:bg-[#070c18] min-h-screen text-gray-900 dark:text-gray-100 font-sans selection:bg-[#D90429]/30">

      {/* Instant WhatsApp & Telegram Alert Banner (News24 Style) */}
      <div className="bg-gradient-to-r from-[#071330] via-emerald-950 to-[#071330] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-500/20 shadow-lg">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-xl">📲</span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">खबर कट के ऑफिशियल व्हाट्सएप चैनल से जुड़ें</h3>
            <p className="text-xs text-gray-300">देश-दुनिया और झारखंड-बिहार की हर बड़ी खबर सीधे आपके व्हाट्सएप पर!</p>
          </div>
        </div>
        <a
          href="https://whatsapp.com/channel/0029Vb8G5ceFXUuZZD4ueG44"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          अभी जुड़ें (Join Channel)
        </a>
      </div>

      {/* Breaking News Ticker (from DB) - Glassmorphism */}
      {breakingNewsTicker.length > 0 && (
        <div className="relative flex items-center gap-4 bg-white dark:bg-[#0d1526] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-sm overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D90429]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="shrink-0 flex items-center gap-2 bg-[#D90429] text-white px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(217,4,41,0.4)]">
            <Flame className="w-3.5 h-3.5 animate-pulse" /> BREAKING
          </span>
          <div className="overflow-hidden whitespace-nowrap relative z-10 w-full">
            <span className="inline-flex gap-10 animate-marquee text-sm font-semibold text-gray-800 dark:text-gray-200">
              {breakingNewsTicker.map((bn) => (
                <Link key={bn.id} href={articleUrl(bn.article)} className="hover:text-[#D90429] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D90429]/50 block" />
                  {bn.headline}
                </Link>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* ── Floating Right Tab: TOP 10 NEWS (AajTak Style) ── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[150] hidden xl:flex flex-col items-center bg-[#2D2D2D] hover:bg-[#D90429] text-white px-2.5 py-4 rounded-l-2xl shadow-2xl transition-colors cursor-pointer group border-l-2 border-white/20">
        <span className="text-lg mb-1 group-hover:scale-125 transition-transform">🎧</span>
        <span className="[writing-mode:vertical-lr] text-[11px] font-black tracking-widest uppercase">
          TOP 10 NEWS
        </span>
      </div>

      {/* ── 1. AajTak Exact 3-Column Layout Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-b border-gray-200 pb-10">
        
        {/* Column 1: Main Feature Article (Left - 6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {featured && (
            <div className="space-y-3">
              {/* Bold Large Headline Above Image */}
              <Link href={articleUrl(featured)} className="group block">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight group-hover:text-[#D90429] transition-colors">
                  {featured.title}
                </h1>
              </Link>

              {/* Main Feature Image */}
              <Link href={articleUrl(featured)} className="block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100 group shadow-md">
                <img
                  src={imgUrl(featured)}
                  alt={imgAlt(featured)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-[#D90429] text-white font-black text-[11px] px-2.5 py-1 rounded shadow">
                  {featured.category?.name || 'मुख्य समाचार'}
                </span>
              </Link>

              {/* Subtitle / Excerpt Text */}
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {featured.short_description || featured.excerpt}
              </p>
            </div>
          )}

          {/* Bottom 3-Card Sub-News Row (AajTak Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {secondaryArticles.slice(0, 3).map((sub: any) => (
              <Link key={sub.id} href={articleUrl(sub)} className="group flex flex-col gap-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
                  <img src={imgUrl(sub)} alt={imgAlt(sub)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-xs font-bold leading-snug text-gray-800 group-hover:text-[#D90429] transition-colors line-clamp-2">
                  {sub.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: सुपरफास्ट NEWS / Superfast News (Center - 3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-[#0d1526] rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
          {/* Superfast Header */}
          <div className="border-b border-gray-200 dark:border-white/10 pb-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="bg-[#D90429] text-white italic font-black text-sm px-3 py-1 rounded-r-full shadow-sm">
                सुपरफास्ट NEWS
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate max-w-[130px]">
                सबसे कम समय में सबसे ज्यादा खबरें...
              </span>
            </div>
          </div>

          {/* Top Featured Superfast Box */}
          {secondaryArticles[3] && (
            <Link href={articleUrl(secondaryArticles[3])} className="group block bg-gray-50 rounded-xl p-2.5 border border-gray-200 mb-4 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={imgUrl(secondaryArticles[3])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#D90429]">
                    {secondaryArticles[3].title}
                  </h4>
                  <span className="text-[10px] font-bold text-[#D90429] flex items-center gap-0.5">
                    और भी ►
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Stacked Superfast Thumbnail List */}
          <div className="space-y-3.5 flex-1 overflow-hidden">
            {articles.slice(4, 9).map((art: any) => (
              <Link key={art.id} href={articleUrl(art)} className="group flex gap-3 items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <img src={imgUrl(art)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#D90429] leading-snug line-clamp-2 pt-0.5">
                  {art.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Live Player & Ads (Right - 3 Cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-5">
          {/* Top ADVERTISEMENT Banner */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2">ADVERTISEMENT</span>
            <div className="h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <span className="text-xs font-black text-[#D90429]">Khabar Cut Banner Ads</span>
            </div>
          </div>

          {/* AajTak Style Live TV Player Card */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-white/10">
            {/* Live TV Tabs */}
            <div className="flex border-b border-white/10 bg-zinc-900 text-xs font-bold text-white">
              <button className="flex-1 py-2 bg-[#D90429] text-center">आजतक</button>
              <button className="flex-1 py-2 text-gray-400 hover:text-white text-center">AT2</button>
            </div>
            {/* Live Video Player Screen */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"
                alt="Live Stream"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white group-hover:scale-110 group-hover:bg-[#D90429] transition-all shadow-2xl">
                <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
              </div>
              <span className="absolute bottom-2 left-3 text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D90429] animate-ping" /> LIVE 24x7 Stream
              </span>
            </div>
          </div>

          {/* E-Paper Promo Banner Card */}
          <Link href="/epaper" className="block bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 text-white shadow-lg group hover:opacity-95 transition-opacity">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">डिजिटल एडिशन</span>
                <h4 className="text-sm font-black mt-1">खबर कट ई-पेपर पढ़ें ➔</h4>
              </div>
              <span className="text-3xl">📰</span>
            </div>
          </Link>
        </div>

      </section>

      {/* 2. Web Stories (Glass Circles) */}
      <section className="bg-white dark:bg-[#0d1526] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2 relative z-10">
          <Sparkles className="w-4 h-4 text-[#F6B100]" />
          वेब स्टोरीज़
        </h2>
        
        <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-4 scrollbar-hide select-none relative z-10 snap-x">
          {[
            { id: '1', title: 'चंद्रयान-4', coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80' },
            { id: '2', title: 'स्वतंत्रता दिवस', coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=300&q=80' },
            { id: '3', title: 'झारखंड उत्सव', coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&q=80' },
            { id: '4', title: 'GPT-5 फीचर्स', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=300&q=80' },
            { id: '5', title: 'क्रिकेट कप', coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&q=80' },
            { id: '6', title: 'मौसम अपडेट', coverImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=300&q=80' },
          ].map((story) => (
            <Link key={story.id} href={`/web-stories/${story.id}`} className="flex flex-col items-center gap-3 shrink-0 group snap-center">
              <div className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-full p-[3px] bg-gradient-to-tr from-[#D90429] via-[#F6B100] to-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <div className="w-full h-full rounded-full border-[3px] border-white dark:border-[#0d1526] overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[90px] text-center truncate group-hover:text-[#D90429] transition-colors">
                {story.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. States & Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#D90429] rounded-full" />
            <h2 className="text-lg sm:text-xl font-black tracking-wide text-gray-900 dark:text-white">ताज़ा एवं राज्य समाचार</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {secondaryArticles.map((article: any) => (
              <Link key={article.id} href={articleUrl(article)} className="group flex flex-col bg-white dark:bg-[#0d1526] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img src={imgUrl(article)} alt={imgAlt(article)} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase shadow-sm">
                    {article.category?.name}
                  </span>
                </div>
                
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-[#D90429] transition-colors mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {article.short_description || article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10 text-[11px] text-gray-500 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {pubDate(article)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {viewCount(article).toLocaleString('hi-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AIRecommendations />
          <MarketWidget />
        </div>
      </section>

      {/* 4. Immersive Video Section */}
      <section className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#D90429]/20 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-80" />
        
        <div className="flex justify-between items-end relative z-10 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-3 mb-2">
              <Play className="w-6 h-6 fill-[#D90429] text-[#D90429]" />
              वीडियो बुलेटिन
            </h2>
            <p className="text-sm text-gray-400">लाइव डिबेट्स और एक्सक्लूसिव रिपोर्ट्स</p>
          </div>
          <Link href="/videos" className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white transition-colors items-center gap-1 border border-white/10">
            सभी देखें <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { id: '1', title: 'झारखंड विकास: सरकार की प्रमुख योजनाएं 2026', views: '1.2M', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
            { id: '2', title: 'स्वतंत्रता दिवस: 78वें स्वतंत्रता दिवस की खास रिपोर्ट', views: '850K', image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=600&q=80' },
            { id: '3', title: 'बिहार-झारखंड आर्थिक सहयोग: नए उद्योग और रोजगार', views: '500K', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80' },
          ].map((vid) => (
            <Link key={vid.id} href="/videos" className="group flex flex-col gap-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg">
                <img src={vid.image} alt={vid.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-[#D90429] group-hover:scale-110 group-hover:border-transparent transition-all duration-300">
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white">
                  {vid.views} Views
                </div>
              </div>
              <h3 className="text-sm font-bold leading-snug text-gray-200 group-hover:text-white transition-colors line-clamp-2">
                {vid.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Categories Grid (Compact Glass Cards) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Category Blocks */}
          {[
            { title: 'टेक्नोलॉजी & विज्ञान', items: articles.slice(13, 17), color: 'bg-blue-500' },
            { title: 'राजनीति & अर्थव्यवस्था', items: articles.slice(17, 21), color: 'bg-emerald-500' }
          ].map((block, idx) => (
            <div key={idx} className="space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3">
                <div className={`w-2 h-2 rounded-full ${block.color}`} />
                <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">{block.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {block.items.map((article: any) => (
                  <Link key={article.id} href={articleUrl(article)} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#0d1526] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                      <img src={imgUrl(article)} alt={imgAlt(article)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="flex flex-col justify-center space-y-2">
                      <h3 className="text-sm font-extrabold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-[#D90429] transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                        <span>{article.category?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span>{pubDate(article)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <StateSelector />
          <SidebarAd />
        </div>
      </section>

      {/* 6. Premium Newsletter Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#D90429]/30 to-purple-600/30 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F6B100]/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gray-200 text-xs font-bold border border-white/10 backdrop-blur-md">
              <Mail className="w-3.5 h-3.5 text-[#F6B100]" /> एक्सक्लूसिव न्यूज़लेटर
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              महत्वपूर्ण खबरें सीधे अपने <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D90429] to-[#F6B100]">इनबॉक्स</span> में पाएं
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              ताज़ा और सत्यापित समाचार अपडेट पाने के लिए आज ही सदस्यता लें। कोई स्पैम नहीं।
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="आपका ईमेल एड्रेस..."
                className="w-full sm:w-[320px] pl-12 pr-5 py-4 text-sm rounded-2xl bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:border-[#D90429] focus:bg-white/10 outline-none transition-all backdrop-blur-md shadow-inner"
              />
            </div>
            <button className="px-8 py-4 bg-[#D90429] hover:bg-[#b00320] text-white font-black text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(217,4,41,0.4)] hover:shadow-[0_0_30px_rgba(217,4,41,0.6)] hover:-translate-y-0.5 active:translate-y-0">
              सब्सक्राइब करें
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
