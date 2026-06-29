import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Video, Clock, Eye, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function VideosPublicPage() {
  const videos = await prisma.video.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedVideos = serializeBigInt(videos);

  const formatDuration = (secs: number | null) => {
    if (!secs) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const featured = serializedVideos.find((v: any) => v.isFeatured) || serializedVideos[0];
  const playlist = serializedVideos.filter((v: any) => v.id !== featured?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 tracking-wider">
          <Play className="h-4 w-4 fill-red-600" /> Television & Broadcasts
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Khabar Cut Videos
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Watch premium news broadcasts, investigative video columns, public interviews, and ground reporting updates.
        </p>
      </div>

      {/* Featured Video Player */}
      {featured ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Container */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 relative border shadow-lg group">
              <video
                src={featured.videoUrl}
                poster={featured.thumbnailUrl || ''}
                controls
                className="h-full w-full object-contain"
              />
              {/* Play overlays */}
              <span className="absolute bottom-4 right-4 bg-black/85 text-white font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                <Clock className="h-3 w-3" />
                {formatDuration(featured.duration)}
              </span>
            </div>
            {/* Title & metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 border-none font-bold uppercase tracking-wider text-[9px]">
                  {featured.category?.name || 'News'}
                </Badge>
                {featured.isFeatured && (
                  <Badge variant="outline" className="text-[9px] uppercase font-bold border-amber-500/30 text-amber-500 bg-amber-500/5">
                    <Sparkles className="h-3 w-3 mr-1 fill-amber-500" /> Featured video
                  </Badge>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-snug">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  {featured.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-bold uppercase pt-1">
                <span>Reporter: {featured.author?.displayName || 'Editorial Desk'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {Number(featured.viewCount).toLocaleString()} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(featured.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-2">
              Recent Video Broadcasts
            </h3>
            {playlist.length === 0 ? (
              <p className="text-xs text-zinc-500">No other videos in playlist.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {playlist.map((vid: any) => (
                  <Link key={vid.id} href={`/videos?id=${vid.id}`} className="flex gap-4 group cursor-pointer border-b pb-4 last:border-b-0 dark:border-zinc-800">
                    <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 border relative bg-zinc-950 flex items-center justify-center">
                      <img src={vid.thumbnailUrl || ''} alt={vid.title} className="h-full w-full object-cover opacity-80" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] text-white px-1 rounded font-mono font-bold">
                        {formatDuration(vid.duration)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-red-500 transition-colors line-clamp-2">
                        {vid.title}
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase">{vid.category?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <Video className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Videos Published</h3>
          <p className="text-xs text-zinc-500 mt-1">Video broadcasts are currently offline. Check back shortly!</p>
        </div>
      )}
    </div>
  );
}
