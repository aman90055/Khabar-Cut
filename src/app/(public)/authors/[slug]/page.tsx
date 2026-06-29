import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Twitter, Facebook, Linkedin, Instagram, Calendar, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function PublicAuthorProfilePage({ params }: PageParams) {
  const { slug } = await params;

  // Fetch author details
  const author = await prisma.author.findFirst({
    where: { slug, deletedAt: null },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          avatarUrl: true,
          role: { select: { name: true } },
          _count: { select: { articles: { where: { deletedAt: null, status: 'PUBLISHED' } } } },
        },
      },
    },
  }).catch(() => null);

  if (!author) {
    notFound();
  }

  // Fetch articles written by this author/user
  // Note: articles are linked to User model via authorId field
  const articles = await prisma.article.findMany({
    where: { authorId: author.userId, status: 'PUBLISHED', deletedAt: null },
    include: {
      category: { select: { name: true, slug: true } },
      featuredImage: { select: { url: true, altText: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 12,
  }).catch(() => []);

  const serializedAuthor = serializeBigInt(author);
  const serializedArticles = serializeBigInt(articles);

  // Parse social links
  let social: any = {};
  if (serializedAuthor.socialLinks && typeof serializedAuthor.socialLinks === 'object') {
    social = serializedAuthor.socialLinks;
  } else if (typeof serializedAuthor.socialLinks === 'string') {
    try {
      social = JSON.parse(serializedAuthor.socialLinks);
    } catch {
      // ignore
    }
  }

  const socialNetworks = [
    { key: 'twitter', label: 'Twitter', icon: Twitter },
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { key: 'instagram', label: 'Instagram', icon: Instagram },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Author Card Info */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm rounded-3xl">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full overflow-hidden shrink-0 border-2 border-red-500/20 bg-zinc-50 dark:bg-zinc-900 shadow">
            {serializedAuthor.avatarUrl || serializedAuthor.user?.avatarUrl ? (
              <img
                src={(serializedAuthor.avatarUrl || serializedAuthor.user?.avatarUrl) ?? undefined}
                alt={serializedAuthor.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 font-bold text-xl uppercase">
                {serializedAuthor.displayName.slice(0, 2)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center justify-center md:justify-start gap-1.5">
                {serializedAuthor.displayName}
                {serializedAuthor.isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-red-500 fill-red-500/10 shrink-0" />
                )}
              </h1>
              <Badge variant="outline" className="w-fit mx-auto md:mx-0 font-bold uppercase text-[9px]">
                {serializedAuthor.user?.role?.name || 'Journalist'}
              </Badge>
            </div>

            {serializedAuthor.bio ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                {serializedAuthor.bio}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic">No biography listed for this reporter.</p>
            )}

            {/* Social handles */}
            <div className="flex justify-center md:justify-start gap-3">
              {socialNetworks.map((net) => {
                const url = social[net.key];
                if (!url) return null;
                const Icon = net.icon;
                return (
                  <a
                    key={net.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 hover:text-red-500 dark:hover:bg-zinc-800 text-zinc-500 rounded-full transition-all border dark:border-zinc-800"
                    title={net.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Aggregate counts */}
          <div className="grid grid-cols-2 gap-4 border dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 shrink-0 min-w-[200px]">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 block">Reports Filed</span>
              <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200 mt-1">
                {serializedAuthor.user?._count?.articles || 0}
              </p>
            </div>
            <div className="text-center border-l dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 block">Verified Status</span>
              <p className="text-xs font-bold text-red-500 mt-3.5 uppercase tracking-wider">
                {serializedAuthor.isVerified ? 'Official Desk' : 'Contributor'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Published Articles feed */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 border-b pb-2">
          <FileText className="h-5 w-5 text-red-500" /> Recent Articles by {serializedAuthor.displayName}
        </h2>

        {serializedArticles.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Published Reports</h3>
            <p className="text-xs text-zinc-500 mt-1">This author hasn't filed any articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serializedArticles.map((art: any) => (
              <Card key={art.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between hover:shadow-md group">
                {art.featuredImage?.url && (
                  <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b">
                    <img
                      src={art.featuredImage.url}
                      alt={art.featuredImage.altText || art.title}
                      className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">
                      {art.category?.name}
                    </span>
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                      <Link href={`/${art.category?.slug}/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(art.publishedAt || art.createdAt), 'dd MMM yyyy')}
                    </span>
                    <Link href={`/${art.category?.slug}/${art.slug}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold gap-1 p-0 hover:bg-transparent text-red-500">
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
  );
}
