import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Eye, Play, Sparkles, TrendingUp, ChevronRight,
  Tv, Cpu, ShieldAlert, Newspaper, Bookmark, Share2, Mail, Flame, CheckCircle, Award
} from 'lucide-react';
import { serializeBigInt } from '@/lib/utils';
import { MarketWidget } from '@/components/widgets/market-widget';
import { InteractivePoll } from '@/components/widgets/interactive-poll';
import { StateSelector } from '@/components/widgets/state-selector';
import { AIRecommendations } from '@/components/widgets/ai-recommendations';

// Premium Enterprise Mock Data as fallback when DB has no items
const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'भारत ने रचा इतिहास, चंद्रयान-4 की सफल लैंडिंग के साथ अंतरिक्ष में लहराया परचम',
    excerpt: 'भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) ने एक बार फिर इतिहास रचते हुए चंद्रमा के दक्षिणी ध्रुव पर चंद्रयान-4 की सॉफ्ट लैंडिंग की है। प्रधानमंत्री नरेंद्र मोदी ने वैज्ञानिकों को बधाई दी है।',
    slug: 'chandrayaan-4-soft-landing-success',
    publishedAt: new Date().toISOString(),
    viewCount: 2420,
    category: { name: 'देश', slug: 'national', color: '#D90429' },
    author: { fullName: 'आदित्य राज' },
    featuredImage: { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', altText: 'Chandrayaan 4' },
  },
  {
    id: '2',
    title: 'उत्तर प्रदेश में बनेगा देश का सबसे बड़ा फिल्म सिटी, सीएम योगी ने दी मंजूरी',
    excerpt: 'नोएडा में 1000 एकड़ भूमि पर बनने वाली इस फिल्म सिटी से लाखों लोगों को रोजगार मिलने की उम्मीद है। बड़ी हस्तियों ने इस प्रोजेक्ट का स्वागत किया है।',
    slug: 'up-film-city-project-nod',
    publishedAt: new Date().toISOString(),
    viewCount: 1820,
    category: { name: 'राज्य', slug: 'states', color: '#0057FF' },
    author: { fullName: 'संजय कुमार' },
    featuredImage: { url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=600&q=80', altText: 'Film City Noida' },
  },
  {
    id: '3',
    title: 'RBI ने आम जनता को दी बड़ी राहत, रेपो रेट में की 0.25% की कटौती',
    excerpt: 'महंगाई के मोर्चे पर राहत मिलने के बाद रिजर्व बैंक ने नीतिगत ब्याज दरों में कटौती का फैसला किया है। इससे होम लोन और कार लोन की EMI कम होगी।',
    slug: 'rbi-repo-rate-cut-news',
    publishedAt: new Date().toISOString(),
    viewCount: 1350,
    category: { name: 'बिज़नेस', slug: 'business', color: '#F6B100' },
    author: { fullName: 'प्रियंका सिंह' },
    featuredImage: { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80', altText: 'RBI rates' },
  },
  {
    id: '4',
    title: 'OpenAI ने लॉन्च किया नया AI मॉडल GPT-5, इंसानों की तरह सोचने की क्षमता',
    excerpt: 'सैम ऑल्टमैन ने दावा किया है कि नया मॉडल तार्किक सोच, कोडिंग और बहुभाषी बातचीत में पिछले सभी संस्करणों से कई गुना अधिक सटीक और तेज है।',
    slug: 'openai-launches-gpt-5-model',
    publishedAt: new Date().toISOString(),
    viewCount: 1950,
    category: { name: 'टेक', slug: 'technology', color: '#8B5CF6' },
    author: { fullName: 'अमित कुमार' },
    featuredImage: { url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80', altText: 'OpenAI GPT 5' },
  },
];

const MOCK_WEB_STORIES = [
  { id: '1', title: 'चंद्रयान-4 की कहानी', coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80' },
  { id: '2', title: 'फिल्म सिटी की झलक', coverImage: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=300&q=80' },
  { id: '3', title: 'बचेगी आपकी EMI?', coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80' },
  { id: '4', title: 'GPT-5 के 5 फीचर्स', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=300&q=80' },
  { id: '5', title: 'विराट कोहली का शतक', coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&q=80' },
  { id: '6', title: 'मौसम का हाल 2026', coverImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=300&q=80' },
];

const MOCK_TRENDING = [
  { rank: '1', title: 'दिल्ली में नया ट्रैफ़िक नियम लागू, जानें क्या है पूरी जानकारी...', views: '2.5M views' },
  { rank: '2', title: 'मुंबई बारिश से बेहाल, देखें वीडियो', views: '1.8M views' },
  { rank: '3', title: 'Share Market में बड़ी गिरावट', views: '1.2M views' },
  { rank: '4', title: 'iPhone 16 लॉन्च, जानें कीमत', views: '980K views' },
  { rank: '5', title: 'सोनाक्षी की नई फ़िल्म का ट्रेलर रिलीज़', views: '870K views' },
];

export default async function HomePage() {
  // Fetch real articles if they exist in DB
  const dbArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    include: {
      category: true,
      author: { select: { fullName: true } },
      featuredImage: { select: { url: true, altText: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  }).catch(() => []);

  const articles = dbArticles.length > 0 ? serializeBigInt(dbArticles) : MOCK_ARTICLES;
  const featured = articles[0];
  const secondaryArticles = articles.slice(1, 4);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10 py-6 sm:py-8 space-y-10 sm:space-y-12">

      {/* 1. Mega Banner: Web Stories Horizontal List */}
      <section className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[#D90429] animate-pulse" />
          ताज़ा वेब स्टोरीज़ (Web Stories)
        </h2>
        <div className="flex gap-4.5 sm:gap-6 overflow-x-auto pb-2 scrollbar-thin select-none">
          {MOCK_WEB_STORIES.map((story) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.id}`}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="story-ring w-[76px] h-[76px] sm:w-[84px] sm:h-[84px]">
                <div className="story-ring-inner w-full h-full">
                  <div className="story-ring-img w-full h-full relative bg-gray-100 dark:bg-gray-800">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 max-w-[80px] text-center truncate group-hover:text-[#D90429] transition-colors">
                {story.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Hero Editorial Grid: Left (Large Featured Story), Center (Trending), Right (Widgets) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Main Column: Featured Article (Lg: col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="section-header">
            <span className="section-accent" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">प्रमुख खबर (Top Story)</h2>
          </div>

          {featured && (
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-md group">
              <img
                src={featured.featuredImage?.url}
                alt={featured.featuredImage?.altText || featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071330]/95 via-[#071330]/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <div className="flex gap-2 mb-3">
                  <span className="kc-badge bg-[#D90429] text-white border-none font-bold text-[9px]">
                    {featured.category?.name || 'विशेष'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mb-3 group-hover:text-[#F6B100] transition-colors text-pretty">
                  <Link href={`/article/${featured.slug}`}>
                    {featured.title}
                  </Link>
                </h1>
                <p className="hidden sm:block text-gray-300 text-xs leading-relaxed line-clamp-2 mb-4 max-w-2xl">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
                  <span>लेखक: {featured.author?.fullName}</span>
                  <span className="dot-sep" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(featured.publishedAt || '').toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Trending Stories (Lg: col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="section-header">
            <span className="section-accent section-accent-blue" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">ट्रेंडिंग न्यूज़</h2>
          </div>

          <div className="space-y-4">
            {MOCK_TRENDING.map((trend) => (
              <div key={trend.rank} className="flex gap-3 group cursor-pointer pb-3.5 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                <span className="trending-number">{trend.rank}</span>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                    <Link href="/search">{trend.title}</Link>
                  </h3>
                  <span className="text-[9px] font-semibold text-gray-400">{trend.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widgets & Ads (Lg: col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <MarketWidget />
          
          {/* Ad Slot */}
          <div className="ad-container ad-rectangle">
            <span className="ad-label">Advertisement</span>
            <div className="text-center p-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Direct Premium Ad</p>
              <p className="text-xs font-bold text-[#D90429]">300 x 250 Sidebar Banner</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI Personalized Row & State News */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: AI recommendations */}
        <div className="lg:col-span-4">
          <AIRecommendations />
        </div>

        {/* Right: State News Grid (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="section-header">
            <span className="section-accent section-accent-gold" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">राज्यों से ताज़ा ख़बरें</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {secondaryArticles.map((article) => (
              <div key={article.id} className="kc-card overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="article-card-img aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                      src={article.featuredImage?.url}
                      alt={article.title}
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 kc-badge bg-white/90 dark:bg-zinc-900/90 text-gray-950 dark:text-white border-none font-bold text-[9px] shadow-sm">
                      {article.category?.name}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-sm sm:text-base font-extrabold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors">
                      <Link href={`/article/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4.5 pt-1.5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(article.publishedAt || '').toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {article.viewCount} व्यूज़
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Luxury Video News Grid (Full Width Banner Style) */}
      <section className="bg-[#071330] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D90429]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-white">
            <Play className="w-4 h-4 fill-[#D90429] text-[#D90429]" />
            वीडियो बुलेटिन & लाइव डिबेट्स
          </h2>
          <Link href="/videos" className="text-xs font-bold text-[#F6B100] hover:underline flex items-center gap-0.5">
            सभी वीडियो देखें <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { id: '1', title: 'Explaining India\'s New Digital Trade Corridors & Global Alliances', views: '25K views', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80' },
            { id: '2', title: 'Bengaluru Smart Transit System: How AI Controls Traffic Signal Junctions', views: '18K views', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80' },
            { id: '3', title: 'Himalayan Tech Valley: Why IT Startups Are Moving to Mountain Cities', views: '12K views', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=80' },
          ].map((vid) => (
            <div key={vid.id} className="group cursor-pointer space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-gray-900 flex items-center justify-center">
                <img
                  src={vid.image}
                  alt={vid.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-104 transition-all duration-300"
                  loading="lazy"
                />
                <div className="play-btn">
                  <div className="play-btn-inner">
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold leading-snug group-hover:text-[#F6B100] transition-colors line-clamp-2">
                  {vid.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold">{vid.views}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Custom Grid Layout: Two columns: Left (Category Blocks), Right (Sidebar Poll/State/Ads) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: Category Blocks (col-span-8) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Tech & Science Block */}
          <div className="space-y-4">
            <div className="section-header">
              <span className="section-accent" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">टेक्नोलॉजी & विज्ञान</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.slice(1, 3).map((article) => (
                <div key={article.id} className="flex gap-4 p-3 rounded-2xl border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526] hover:shadow-md transition-all group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={article.featuredImage?.url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col justify-between py-1">
                    <h3 className="text-xs sm:text-sm font-extrabold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/article/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
                      <span>{article.category?.name}</span>
                      <span className="dot-sep" />
                      <span>{new Date(article.publishedAt || '').toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Politics & Business Block */}
          <div className="space-y-4">
            <div className="section-header">
              <span className="section-accent section-accent-blue" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">राजनीति & बिज़नेस</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.slice(2, 4).map((article) => (
                <div key={article.id} className="flex gap-4 p-3 rounded-2xl border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526] hover:shadow-md transition-all group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={article.featuredImage?.url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col justify-between py-1">
                    <h3 className="text-xs sm:text-sm font-extrabold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/article/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
                      <span>{article.category?.name}</span>
                      <span className="dot-sep" />
                      <span>{new Date(article.publishedAt || '').toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar widgets (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <StateSelector />
          <InteractivePoll />
          
          {/* Ad Slot */}
          <div className="ad-container ad-rectangle">
            <span className="ad-label">Advertisement</span>
            <div className="text-center p-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Affiliate Ad Slot</p>
              <p className="text-xs font-bold text-[#0057FF]">300 x 250 Banner Ad</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Luxury Premium Newsletter Banner */}
      <section className="bg-gradient-to-br from-[#071330] to-[#0A1D46] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0057FF]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[#F6B100] text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
              ✓ दैनिक समाचार पत्र
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              महत्वपूर्ण खबरें सीधे अपने ईमेल इनबॉक्स में पाएं
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              ताज़ा और सत्यापित समाचार अपडेट पाने के लिए आज ही सदस्यता लें। कोई स्पैम नहीं।
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
            <input
              type="email"
              placeholder="अपना ईमेल दर्ज करें (yourname@email.com)"
              className="px-5 py-3 text-sm rounded-full bg-white/10 text-white placeholder-gray-400 border border-white/15 focus:border-[#F6B100] focus:ring-2 focus:ring-[#F6B100]/25 outline-none min-w-[260px] lg:min-w-[320px] transition-all"
            />
            <button className="px-6 py-3 bg-[#D90429] hover:bg-[#A80320] text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              सब्सक्राइब करें
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
