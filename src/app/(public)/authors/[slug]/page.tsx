import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Twitter, Facebook, Instagram, Clock, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: author } = await supabase
    .from('authors')
    .select('display_name')
    .eq('slug', slug)
    .single();

  if (!author) return { title: 'Author Not Found | Khabar Cut' };
  return { title: `${author.display_name} - पत्रकार | Khabar Cut` };
}

export default async function PublicAuthorProfilePage({ params }: PageParams) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch author details
  const { data: author } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!author) {
    notFound();
  }

  // Fetch articles written by this author
  const authorUserId = author.user_id || author.id;
  const { data: articles, count } = await supabase
    .from('articles')
    .select(`
      id, 
      title, 
      slug, 
      published_at,
      views:view_count,
      category:categories!category_id(name, slug), 
      featured_image:media!featured_image_id(public_url:url, alt_text)
    `, { count: 'exact' })
    .eq('author_id', authorUserId)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(12);

  const totalViews = articles?.reduce((acc, curr: any) => acc + (curr.views || 0), 0) || 0;

  const socialNetworks = [
    { key: 'twitter_url', label: 'Twitter', icon: Twitter },
    { key: 'facebook_url', label: 'Facebook', icon: Facebook },
    { key: 'instagram_url', label: 'Instagram', icon: Instagram },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-8 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
          <Link href="/" className="hover:text-[#D90429]">होम</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/authors" className="hover:text-[#D90429]">Authors</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{author.display_name}</span>
        </nav>

        {/* Author Card Info */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-sm rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full overflow-hidden shrink-0 border-2 border-[#D90429]/20 bg-zinc-50 dark:bg-zinc-900 shadow">
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 font-bold text-xl uppercase">
                  {author.display_name.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center justify-center md:justify-start gap-1.5">
                  {author.display_name}
                  {author.is_verified && (
                    <CheckCircle2 className="h-5 w-5 text-[#D90429] fill-[#D90429]/10 shrink-0" />
                  )}
                </h1>
                <Badge variant="outline" className="w-fit mx-auto md:mx-0 font-bold uppercase text-[9px] border-[#D90429]/30 text-[#D90429]">
                  {author.designation || 'Journalist'}
                </Badge>
              </div>

              {author.bio ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {author.bio}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 italic">No biography listed for this reporter.</p>
              )}

              {/* Social handles */}
              <div className="flex justify-center md:justify-start gap-3">
                {socialNetworks.map((net) => {
                  const url = (author as any)[net.key];
                  if (!url) return null;
                  const Icon = net.icon;
                  return (
                    <a
                      key={net.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-[#D90429]/10 hover:text-[#D90429] text-zinc-500 rounded-full transition-all border border-zinc-200 dark:border-zinc-700"
                      title={net.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Aggregate counts */}
            <div className="grid grid-cols-2 gap-4 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl bg-white dark:bg-zinc-950 shrink-0 min-w-[200px]">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Reports Filed</span>
                <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200 mt-1">
                  {count || 0}
                </p>
              </div>
              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Total Views</span>
                <p className="text-2xl font-black text-[#D90429] mt-1">
                  {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k+` : totalViews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Published Articles feed */}
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <FileText className="h-5 w-5 text-[#D90429]" /> Recent Articles by {author.display_name}
          </h2>

          {!articles || articles.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
              <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Published Reports</h3>
              <p className="text-xs text-zinc-500 mt-1">This author hasn't filed any articles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art: any) => (
                <Card key={art.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group rounded-2xl">
                  {art.featured_image?.public_url && (
                    <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                      <img
                        src={art.featured_image.public_url}
                        alt={art.featured_image.alt_text || art.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#D90429] font-bold uppercase tracking-wider block">
                        {(art.category as any)?.name}
                      </span>
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 group-hover:text-[#D90429] transition-colors">
                        <Link href={`/${(art.category as any)?.slug}/${art.slug}`}>
                          {art.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {art.published_at ? new Date(art.published_at).toLocaleDateString('hi-IN') : ''}
                      </span>
                      <Link href={`/${(art.category as any)?.slug}/${art.slug}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-bold gap-1 p-0 hover:bg-transparent text-[#D90429]">
                          Read Report <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
