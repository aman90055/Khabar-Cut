import { getStateBySlug, getDistrictsByState } from '@/lib/db/states';
import { getPublishedArticles } from '@/lib/db/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';
import { SidebarAd } from '@/components/ads/google-ad';
import type { Metadata } from 'next';
import { Clock, User } from 'lucide-react';
import type { ArticleListItem } from '@/types/supabase';

// Helper functions
const imgUrl = (article: any) => 
  article.featured_image?.public_url || article.featuredImage?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
const authorName = (article: any) => 
  article.author?.display_name || article.author?.fullName || 'खबर कट';
const pubDate = (article: any) => 
  article.published_at ? format(new Date(article.published_at), 'dd MMM yyyy', { locale: hi }) : '';

const FALLBACK_STATES = [
  { id: '1', name: 'झारखंड', slug: 'jharkhand', code: 'JH', is_active: true, created_at: '' },
  { id: '2', name: 'बिहार', slug: 'bihar', code: 'BR', is_active: true, created_at: '' },
  { id: '3', name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', code: 'UP', is_active: true, created_at: '' },
  { id: '4', name: 'दिल्ली', slug: 'delhi', code: 'DL', is_active: true, created_at: '' },
  { id: '5', name: 'महाराष्ट्र', slug: 'maharashtra', code: 'MH', is_active: true, created_at: '' },
  { id: '6', name: 'राजस्थान', slug: 'rajasthan', code: 'RJ', is_active: true, created_at: '' },
  { id: '7', name: 'मध्य प्रदेश', slug: 'madhya-pradesh', code: 'MP', is_active: true, created_at: '' },
  { id: '8', name: 'छत्तीसगढ़', slug: 'chhattisgarh', code: 'CG', is_active: true, created_at: '' },
  { id: '9', name: 'पश्चिम बंगाल', slug: 'west-bengal', code: 'WB', is_active: true, created_at: '' },
  { id: '10', name: 'ओडिशा', slug: 'odisha', code: 'OD', is_active: true, created_at: '' },
];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let state = await getStateBySlug(slug);
  if (!state) {
    state = FALLBACK_STATES.find((s) => s.slug === slug) as any;
  }
  return {
    title: `${state?.name || slug} समाचार | Khabar Cut`,
    description: `${state?.name || slug} की ताज़ा खबरें, विश्लेषण और विशेष रिपोर्ट।`,
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  
  let state = await getStateBySlug(slug);
  
  if (!state) {
    const fallbackState = FALLBACK_STATES.find(s => s.slug === slug);
    if (!fallbackState) {
      notFound();
    }
    state = fallbackState as any;
  }

  const articles = await getPublishedArticles({ categorySlug: slug, limit: 12 });
  const districts = await getDistrictsByState(state!.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-6">{state?.name} समाचार</h1>
          
          {districts && districts.length > 0 && (
            <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex gap-2">
                {districts.map((district) => (
                  <Link
                    key={district.id}
                    href={`/districts/${district.slug}`}
                    className="whitespace-nowrap px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors text-sm"
                  >
                    {district.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-white/10 bg-white/5">
              <p className="text-xl text-muted-foreground">अभी कोई खबर नहीं है</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/${article.category?.slug || 'news'}/${article.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden flex flex-col hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={imgUrl(article)}
                      alt={article.title || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {article.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {authorName(article)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pubDate(article)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <aside className="lg:w-[300px] xl:w-[336px]">
          <div className="sticky top-24">
            <SidebarAd />
          </div>
        </aside>
      </div>
    </main>
  );
}
