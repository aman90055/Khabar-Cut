import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function DistrictDetailPage({ params }: PageParams) {
  const { slug } = await params;

  // Fetch district details
  const district = await prisma.district.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      state: { select: { id: true, name: true, slug: true } },
    },
  }).catch(() => null);

  if (!district) {
    notFound();
  }

  // Fetch articles belonging to this district
  const articles = await prisma.article.findMany({
    where: { districtId: district.id, status: 'PUBLISHED', deletedAt: null },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { fullName: true } },
      featuredImage: { select: { url: true, altText: true } },
    },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => []);

  const serializedDistrict = serializeBigInt(district);
  const serializedArticles = serializeBigInt(articles);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href={`/states/${serializedDistrict.state?.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {serializedDistrict.state?.name} News
        </Link>
      </div>

      {/* District Header */}
      <div className="border-b pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-600 border-none font-bold uppercase tracking-wider text-[9px] py-1">
            District Hub
          </Badge>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {serializedDistrict.state?.name}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {serializedDistrict.name} Local Desk
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl">
          Hyper-local reports, community bulletins, sports tournaments, and administrative notices from the {serializedDistrict.name} municipal block.
        </p>
      </div>

      {/* Article Feed grid */}
      {serializedArticles.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <MapPin className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Local Reports</h3>
          <p className="text-xs text-zinc-500 mt-1">There are no hyper-local reports filed for {serializedDistrict.name} today. Check back shortly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedArticles.map((art: any) => (
            <Card key={art.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between hover:shadow-md group">
              {/* Optional featured image */}
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
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase">
                    <span className="text-red-500">{art.category?.name}</span>
                    <span>By {art.author?.fullName}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                    <Link href={`/${art.category?.slug}/${art.slug}`}>
                      {art.title}
                    </Link>
                  </h3>
                  {art.excerpt && (
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  )}
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
  );
}
