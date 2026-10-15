import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Eye, Calendar, User, CheckCircle2, Bookmark, Share2,
  ChevronRight, ArrowLeft, MessageSquare, AlertCircle, ShieldCheck
} from 'lucide-react';
import { serializeBigInt } from '@/lib/utils';
import { getAbsoluteUrl, getArticleUrl } from '@/utils/url';
import { siteConfig } from '@/config/site';
import { ArticleActions } from '@/components/articles/article-actions';
import { InArticleAd, SidebarAd } from '@/components/ads/google-ad';
import { getArticleBySlug, getPublishedArticles } from '@/lib/db/articles';
import { CommentsSection } from '@/components/comments/comments-section';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Custom Editor.js block renderer conforming to the premium design system
function renderEditorBlock(block: any) {
  const data = block.data || {};
  switch (block.type) {
    case 'header': {
      const text = data.text || '';
      if (data.level === 1) {
        return (
          <h1
            key={block.id}
            className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-8 mb-4 tracking-tight font-display"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      if (data.level === 3) {
        return (
          <h3
            key={block.id}
            className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 tracking-tight"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      return (
        <h2
          key={block.id}
          className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-7 mb-3.5 tracking-tight font-display border-l-4 border-[#0057FF] pl-3"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    case 'paragraph':
      return (
        <p
          key={block.id}
          className="text-[15.5px] sm:text-[16.5px] text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-justify"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );
    case 'list': {
      const Tag = data.style === 'ordered' ? 'ol' : 'ul';
      const listClass = data.style === 'ordered'
        ? 'list-decimal pl-6 space-y-2 mb-5 text-gray-700 dark:text-gray-300'
        : 'list-disc pl-6 space-y-2 mb-5 text-gray-700 dark:text-gray-300';
      return (
        <Tag key={block.id} className={listClass}>
          {data.items?.map((item: string, idx: number) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: item }}
              className="text-[14.5px] sm:text-[15.5px] leading-relaxed"
            />
          ))}
        </Tag>
      );
    }
    case 'quote':
      return (
        <blockquote
          key={block.id}
          className="border-l-4 border-[#D90429] bg-gray-50 dark:bg-white/2 px-5 py-4 my-6 italic text-gray-800 dark:text-gray-200 text-sm sm:text-base rounded-r-2xl"
        >
          <p className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.text }} />
          {data.caption && (
            <cite className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mt-1">
              — {data.caption}
            </cite>
          )}
        </blockquote>
      );
    case 'code':
      return (
        <pre
          key={block.id}
          className="bg-[#071330] text-gray-100 p-5 rounded-2xl overflow-x-auto text-[13px] font-mono mb-5 border border-white/5 shadow-inner"
        >
          <code>{data.code}</code>
        </pre>
      );
    case 'image':
      return (
        <figure key={block.id} className="my-8 space-y-2.5">
          <img
            src={data.file?.url || data.url}
            alt={data.caption || ''}
            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
          />
          {data.caption && (
            <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 font-bold">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'delimiter':
      return <hr key={block.id} className="my-8 border-gray-200/60 dark:border-white/5" />;
    default:
      return null;
  }
}

// Fallback Article to show beautiful visual layout if DB lacks content
const MOCK_ARTICLE = {
  title: 'भारत ने रचा इतिहास, चंद्रयान-4 की सफल लैंडिंग के साथ अंतरिक्ष में लहराया परचम',
  slug: 'chandrayaan-4-soft-landing-success',
  excerpt: 'भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) ने एक बार फिर इतिहास रचते हुए चंद्रमा के दक्षिणी ध्रुव पर चंद्रयान-4 की सॉफ्ट लैंडिंग की है। प्रधानमंत्री नरेंद्र मोदी ने वैज्ञानिकों को बधाई दी है।',
  publishedAt: new Date(),
  viewCount: 2420,
  readingTime: 5,
  category: { name: 'देश', slug: 'national' },
  author: { fullName: 'आदित्य राज' },
  featuredImage: { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', altText: 'Quantum Research' },
  content: {
    blocks: [
      { id: '1', type: 'paragraph', data: { text: 'भारत ने एक बार फिर अंतरिक्ष विज्ञान के क्षेत्र में अपनी ताकत का लोहा मनवाया है। इसरो (ISRO) के वैज्ञानिकों की दिन-रात की मेहनत के बाद <b>चंद्रयान-4</b> ने चंद्रमा के दक्षिणी ध्रुव पर सफलतापूर्वक कदम रख दिया है। यह सफलता भारत को दुनिया के उन चुनिंदा देशों की श्रेणी में सबसे आगे खड़ा करती है जो चांद के इस दुर्गम इलाके तक पहुंचे हैं।' } },
      { id: '2', type: 'header', data: { text: 'मिशन की मुख्य बातें', level: 2 } },
      { id: '3', type: 'paragraph', data: { text: 'इसरो द्वारा दी गई जानकारी के अनुसार, चंद्रयान-4 मिशन के निम्नलिखित मुख्य उद्देश्य हैं:' } },
      { id: '4', type: 'list', data: { style: 'unordered', items: ['चंद्रमा की सतह से मिट्टी और चट्टानों के नमूने एकत्र कर सुरक्षित रूप से पृथ्वी पर वापस लाना।', 'पानी की खोज को और अधिक सघनता से आगे बढ़ाना तथा वहाँ के वातावरण का विस्तृत अध्ययन करना।', 'आने वाले भविष्य में मानवयुक्त मिशनों के लिए आधारभूत डेटा तैयार करना।'] } },
      { id: '5', type: 'quote', data: { text: 'यह भारत के वैज्ञानिकों की अटूट प्रतिबद्धता और दृढ़ संकल्प का परिणाम है। पूरा देश इस गौरवपूर्ण क्षण पर गर्व महसूस कर रहा है।', caption: 'डॉ. एस. सोमनाथ, इसरो प्रमुख' } }
    ]
  }
};

const MOCK_RELATED = [
  { id: 'rel1', title: 'इसरो का अगला मिशन: सूर्य के रहस्य सुलझाने को तैयार आदित्य-L2', slug: 'isro-aditya-l2-mission', category: { name: 'विज्ञान', slug: 'science' } },
  { id: 'rel2', title: 'नासा ने भी माना भारत का लोहा, चंद्रयान-4 की सफलता पर दी बधाई', slug: 'nasa-congratulates-isro', category: { name: 'अंतरराष्ट्रीय', slug: 'world' } },
  { id: 'rel3', title: 'स्पेस टेक्नोलॉजी में भारतीय स्टार्टअप्स का दबदबा: करोड़ों का नया निवेश', slug: 'space-tech-startups-india', category: { name: 'टेक', slug: 'technology' } },
];

import { ARTICLES_DATA } from '@/data/news-articles';

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { category: categorySlug, slug } = await params;

  // 1. Try Supabase 25-table schema first
  const sbArticle = await getArticleBySlug(categorySlug, slug);

  // 2. Fallback: static ARTICLES_DATA or MOCK_ARTICLE
  const matchedFromArticlesData = ARTICLES_DATA.find((a: any) => a.slug === slug);
  const rawData = sbArticle ?? matchedFromArticlesData ?? (slug === MOCK_ARTICLE.slug ? MOCK_ARTICLE : ARTICLES_DATA[0]);

  if (!rawData) {
    notFound();
  }

  // Normalize fields: Supabase schema uses snake_case, legacy uses camelCase
  const data: any = {
    ...rawData,
    // Supabase fields → legacy-compatible names for JSX below
    title: (rawData as any).title,
    slug: (rawData as any).slug,
    excerpt: (rawData as any).short_description ?? (rawData as any).excerpt,
    publishedAt: (rawData as any).published_at ?? (rawData as any).publishedAt,
    viewCount: (rawData as any).views ?? (rawData as any).viewCount ?? 0,
    readingTime: (rawData as any).reading_time ?? (rawData as any).readingTime,
    author: (rawData as any).author
      ? {
          fullName: (rawData as any).author.full_name ?? (rawData as any).author.display_name ?? (rawData as any).author.fullName ?? 'Aman Vishwakarma',
          ...(rawData as any).author,
        }
      : { fullName: 'Aman Vishwakarma' },
    category: (rawData as any).category ?? null,
    featuredImage: (rawData as any).featured_image
      ? {
          url: (rawData as any).featured_image.url || (rawData as any).featured_image.public_url,
          altText: (rawData as any).featured_image.alt_text ?? (rawData as any).title,
        }
      : (rawData as any).featuredImage ?? null,
  };

  if (!data) {
    notFound();
  }

  // Parse Slate/JSON blocks, Editor.js blocks, or string paragraphs
  let blocks: any[] = [];
  if (data.content && typeof data.content === 'object') {
    const contentObj = data.content as any;
    if (Array.isArray(contentObj.blocks)) {
      blocks = contentObj.blocks;
    } else if (Array.isArray(contentObj)) {
      blocks = contentObj.map((item: any, idx: number) => ({
        id: `b-${idx}`,
        type: item.type === 'heading-2' ? 'header' : (item.type || 'paragraph'),
        data: {
          text: item.children ? item.children.map((c: any) => c.text).join('') : (item.text || ''),
          level: 2,
        },
      }));
    }
  } else if (typeof data.content === 'string') {
    try {
      const parsed = JSON.parse(data.content);
      if (Array.isArray(parsed)) {
        blocks = parsed.map((item: any, idx: number) => ({
          id: `b-${idx}`,
          type: item.type === 'heading-2' ? 'header' : (item.type || 'paragraph'),
          data: {
            text: item.children ? item.children.map((c: any) => c.text).join('') : (item.text || ''),
            level: 2,
          },
        }));
      } else if (parsed && Array.isArray(parsed.blocks)) {
        blocks = parsed.blocks;
      }
    } catch {
      blocks = data.content.split('\n\n').filter(Boolean).map((para: string, idx: number) => ({
        id: `p-${idx}`,
        type: 'paragraph',
        data: { text: para.trim() }
      }));
    }
  }

  // Schema.org Structured Data — NewsArticle (Google News compliant)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': data.title,
    'description': data.excerpt ?? '',
    'datePublished': data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString(),
    'dateModified': (rawData as any).updated_at ? new Date((rawData as any).updated_at).toISOString() : undefined,
    'inLanguage': 'hi-IN',
    'author': {
      '@type': 'Person',
      'name': data.author?.fullName ?? 'Khabar Cut Newsroom',
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': siteConfig.name,
      'logo': {
        '@type': 'ImageObject',
        'url': getAbsoluteUrl('/logo.png'),
        'width': 512,
        'height': 512,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': getAbsoluteUrl(getArticleUrl(categorySlug, slug)),
    },
    'image': data.featuredImage?.url
      ? [{
          '@type': 'ImageObject',
          'url': data.featuredImage.url,
          'width': 1200,
          'height': 630,
        }]
      : [],
    'articleSection': data.category?.name ?? 'समाचार',
    'keywords': (rawData as any).tags?.map((t: any) => t.name).join(', ') ?? '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10 py-6 sm:py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#D90429] mb-6 transition-colors no-print"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          वापस मुख्य पृष्ठ पर
        </Link>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Content (col-span-8) */}
          <article className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="kc-badge bg-[#D90429] text-white border-none font-bold text-[9px]">
                  {data.category?.name || 'समाचार'}
                </span>
                <span className="kc-badge bg-blue-500/10 text-[#0057FF] border border-blue-500/20 font-bold text-[9px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> सत्यापित (Verified)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight font-display tracking-tight text-pretty">
                {data.title}
              </h1>

              <p className="text-[15px] sm:text-[17px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed border-l-4 border-[#0057FF] pl-4 py-0.5">
                {data.excerpt}
              </p>
            </div>

            {/* Author / Metadata Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200/60 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 font-semibold no-print">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-white/5">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold flex items-center gap-1">
                    {data.author?.fullName}
                    <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                  </p>
                  <p className="text-[10px] text-gray-400">वरिष्ठ पत्रकार</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(data.publishedAt || '').toLocaleDateString('hi-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {(data as any).readTime || (data as any).readingTime || '4 मिनट'}
                </span>
                <span className="flex items-center gap-1 text-[#D90429] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  <Eye className="w-3.5 h-3.5" />
                  {data.viewCount?.toString()} लाइव पाठक
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {data.featuredImage?.url && (
              <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden border border-gray-150 dark:border-white/5 shadow-md">
                <img
                  src={data.featuredImage.url}
                  alt={data.featuredImage.altText || data.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content Render */}
            <div className="prose-kc pt-4">
              {blocks.length > 0 ? (
                blocks.map((block) => renderEditorBlock(block))
              ) : (
                <p className="text-gray-500 italic">No content available for this article.</p>
              )}
            </div>

            {/* ✅ Google AdSense In-Article Ad */}
            <InArticleAd />

            {/* Reactions & Actions */}
            <ArticleActions articleTitle={data.title} />

            {/* Comments Section */}
            {data.id && <CommentsSection articleId={data.id} />}

          </article>

          {/* Sidebar Columns (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24 no-print">
            
            {/* Newsletter Subscription */}
            <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
              <span className="kc-badge bg-[#0057FF]/10 text-[#0057FF] border border-[#0057FF]/20 font-bold text-[9px] flex items-center gap-1 w-fit">
                <MessageSquare className="w-3.5 h-3.5" /> न्यूज़लेटर
              </span>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                सभी महत्वपूर्ण विश्लेषण अपने इनबॉक्स में प्राप्त करें
              </h3>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="अपना ईमेल दर्ज करें"
                  className="w-full px-4 py-2.5 text-xs rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#D90429] transition-all"
                />
                <button className="w-full py-2.5 bg-[#D90429] hover:bg-[#A80320] text-white font-bold text-xs rounded-full transition-all">
                  सदस्यता लें
                </button>
              </div>
            </div>

            {/* Related News Stack */}
            <div className="bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5 pb-2">
                संबंधित खबरें (Related Articles)
              </p>
              <div className="space-y-4">
                {MOCK_RELATED.map((item) => (
                  <div key={item.id} className="space-y-1.5 group cursor-pointer">
                    <span className="text-[9px] font-black text-[#0057FF] uppercase tracking-wide">
                      {item.category.name}
                    </span>
                    <h4 className="text-xs font-bold leading-snug text-gray-900 dark:text-white group-hover:text-[#D90429] transition-colors line-clamp-2">
                      <Link href={`/${item.category.slug}/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Google AdSense Sidebar Ad */}
            <SidebarAd />

          </aside>
        </div>
      </div>
    </>
  );
}
