import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, Eye, Sparkles, ChevronRight, Award, Flame, Star } from 'lucide-react';
import { serializeBigInt } from '@/lib/utils';

// Fallback articles to ensure the page has visually appealing content during initial setup
const MOCK_MAPPED_ARTICLES: Record<string, any[]> = {
  technology: [
    {
      id: 'tech1',
      title: 'भारत में सेमीकंडक्टर क्रांति: 3 नए बड़े चिप फैब्रिकेशन प्लांट को मिली मंजूरी',
      excerpt: 'टाटा ग्रुप और वैश्विक चिप निर्माताओं की भागीदारी में गुजरात और असम में ₹1.25 लाख करोड़ के निवेश से तैयार होंगे भारत के पहले चिप निर्माण कारखाने।',
      slug: 'semiconductor-revolution-india-new-plants',
      publishedAt: new Date().toISOString(),
      viewCount: 1420,
      author: { fullName: 'अमित कुमार' },
      featuredImage: { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80' },
    },
    {
      id: 'tech2',
      title: 'क्या है भारत का स्वदेशी ऑपरेटिंग सिस्टम (BharOS)? जानें कैसे है एंड्रॉइड से अलग',
      excerpt: 'सुरक्षा और गोपनीयता पर केंद्रित इस ऑपरेटिंग सिस्टम को आईआईटी मद्रास की इनक्यूबेटेड कंपनी ने तैयार किया है, जो चीनी ऐप्स से सुरक्षा देगा।',
      slug: 'bharos-operating-system-explained',
      publishedAt: new Date().toISOString(),
      viewCount: 880,
      author: { fullName: 'प्रिया शर्मा' },
      featuredImage: { url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80' },
    }
  ],
  business: [
    {
      id: 'biz1',
      title: 'भारतीय स्टार्टअप्स की धूम: 2026 की पहली तिमाही में 8 नए यूनिकॉर्न बने',
      excerpt: 'फिनटेक, एआई और रिन्यूएबल एनर्जी सेक्टर में भारतीय उद्यमियों ने खींचा वैश्विक निवेशकों का ध्यान, फंड की कोई कमी नहीं।',
      slug: 'indian-startups-unicorn-boom-2026',
      publishedAt: new Date().toISOString(),
      viewCount: 2020,
      author: { fullName: 'राजेश मेहता' },
      featuredImage: { url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80' },
    }
  ],
  national: [
    {
      id: 'nat1',
      title: 'बुलेट ट्रेन प्रोजेक्ट अपडेट: मुंबई-अहमदाबाद ट्रैक बिछाने का काम 80% पूरा',
      excerpt: 'रेल मंत्रालय ने बताया कि 2027 के मध्य तक पहली बुलेट ट्रेन दौड़ाने का लक्ष्य है, सुरक्षा मानकों का विशेष ख्याल रखा जा रहा है।',
      slug: 'bullet-train-project-track-laying-update',
      publishedAt: new Date().toISOString(),
      viewCount: 1870,
      author: { fullName: 'संजय राज' },
      featuredImage: { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80' },
    }
  ]
};

// Sub-categories map to render sub-nav tags
const SUB_CATEGORIES: Record<string, string[]> = {
  national: ['राजनीति', 'विकास', 'क्राइम', 'संस्कृति'],
  technology: ['गैजेट्स', 'एआई (AI)', 'सुरक्षा', 'टेलीकॉम'],
  business: ['बाज़ार', 'बैंकिंग', 'स्टार्टअप', 'ऑटो'],
  world: ['पड़ोसी देश', 'ग्लोबल पॉलिसी', 'अमेरिका'],
  sports: ['क्रिकेट', 'फुटबॉल', 'ओलंपिक', 'टेनिस'],
};

const CATEGORY_NAMES: Record<string, string> = {
  national: 'भारत (National)',
  technology: 'टेक्नोलॉजी (Tech)',
  business: 'बिज़नेस (Business)',
  world: 'विश्व (World)',
  sports: 'स्पोर्ट्स (Sports)',
  entertainment: 'मनोरंजन (Entertainment)',
  states: 'राज्य (States)',
};

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  // Find Category in DB
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug, deletedAt: null },
  }).catch(() => null);

  // Fetch real articles under this category from DB
  const dbArticles = category
    ? await prisma.article.findMany({
        where: { categoryId: category.id, status: 'PUBLISHED', deletedAt: null },
        include: {
          author: { select: { fullName: true } },
          featuredImage: { select: { url: true, altText: true } },
        },
        orderBy: { publishedAt: 'desc' },
      }).catch(() => [])
    : [];

  const categoryName = category?.name || CATEGORY_NAMES[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const articles = dbArticles.length > 0 ? serializeBigInt(dbArticles) : (MOCK_MAPPED_ARTICLES[categorySlug] || MOCK_MAPPED_ARTICLES.national);

  if (articles.length === 0 && !category) {
    notFound();
  }

  const subcats = SUB_CATEGORIES[categorySlug] || ['ताज़ा समाचार', 'विशेष रिपोर्ट्स', 'विश्लेषण'];

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
          {category?.description || `${categoryName} की ताज़ा ख़बरें, विश्लेषण और विशेष रिपोर्ट यहाँ पढ़ें।`}
        </p>

        {/* Sub-categories tags */}
        <div className="flex gap-2 overflow-x-auto pt-5 border-t border-gray-100 dark:border-white/5 mt-5 scrollbar-thin">
          {subcats.map((sub, idx) => (
            <button
              key={idx}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[#D90429] hover:text-[#D90429] hover:bg-red-50/10 dark:hover:bg-red-950/20 transition-all whitespace-nowrap`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Articles List (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="kc-card overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="article-card-img aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                      src={article.featuredImage?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'}
                      alt={article.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <h2 className="text-sm sm:text-base font-extrabold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/${categorySlug}/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 font-semibold mt-auto">
                  <span>लेखक: {article.author?.fullName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(article.publishedAt || '').toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (col-span-4) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Ad Slot */}
          <div className="ad-container ad-rectangle">
            <span className="ad-label">Advertisement</span>
            <div className="text-center p-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Direct Premium Ad</p>
              <p className="text-xs font-bold text-[#D90429]">300 x 250 Sidebar Banner</p>
            </div>
          </div>

          {/* Special Feature Widget */}
          <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
              <Award className="w-4 h-4 text-[#F6B100]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">संपादक की पसंद (Editor's Picks)</span>
            </div>
            <div className="space-y-3">
              {articles.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img src={item.featuredImage?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-extrabold text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/${categorySlug}/${item.slug}`}>{item.title}</Link>
                    </h4>
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
