import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Plus, Trash2, Edit, Play, Clock, Eye, Star } from 'lucide-react';
import { format } from 'date-fns';
import { deleteVideo, publishVideo } from '@/features/videos/actions';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  status?: string;
}

export default async function VideosAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const status = params.status || '';

  const where = {
    deletedAt: null,
    ...(status && { status: status as any }),
    ...(query && {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { slug: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  };

  const videos = await prisma.video.findMany({
    where,
    include: {
      category: { select: { name: true } },
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

  async function handleDelete(id: string) {
    'use server';
    await deleteVideo(id);
  }

  async function handlePublish(id: string) {
    'use server';
    await publishVideo(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Video CMS</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage video stories, television broadcasts, live clips, and featured playlists.</p>
        </div>
        <Link href="/admin/videos/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </Link>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <form className="flex flex-wrap gap-4 w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Search Videos</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by title or slug..."
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-[180px]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Filter Status</span>
            <select
              name="status"
              defaultValue={status}
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PROCESSING">Processing</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="self-end flex gap-2">
            <Button type="submit" size="sm" className="font-semibold h-9">Filter</Button>
            <Link href="/admin/videos">
              <Button type="button" variant="outline" size="sm" className="font-semibold h-9">Reset</Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Video Cards Grid */}
      {serializedVideos.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Video className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Videos Uploaded</h3>
          <p className="text-xs text-zinc-500 mt-1">Upload mp4 or stream URL links to embed video content in your articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedVideos.map((vid: any) => (
            <Card key={vid.id} className="border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              {/* Thumbnail preview */}
              <div className="aspect-video w-full relative bg-zinc-100 dark:bg-zinc-900 border-b">
                {vid.thumbnailUrl ? (
                  <img src={vid.thumbnailUrl} alt={vid.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <Video className="h-10 w-10" />
                  </div>
                )}
                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                  <Clock className="h-3 w-3" />
                  {formatDuration(vid.duration)}
                </span>
                {/* Play Button Icon */}
                <span className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-90 shadow-lg hover:scale-105 transition-transform">
                  <Play className="h-5 w-5 fill-white" />
                </span>
                {/* Featured Badge */}
                {vid.isFeatured && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                )}
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{vid.category?.name || 'Uncategorized'}</span>
                    <Badge
                      className={`border-none font-bold uppercase text-[8px] ${
                        vid.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : vid.status === 'DRAFT'
                          ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {vid.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">
                    {vid.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold pt-1">
                    <span>By {vid.author?.displayName || 'Reporter'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {Number(vid.viewCount).toLocaleString()} views
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-semibold">
                    Added: {format(new Date(vid.createdAt), 'dd MMM yyyy')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {vid.status === 'DRAFT' && (
                      <form action={handlePublish.bind(null, vid.id)}>
                        <Button size="sm" className="font-bold text-[10px] h-7 px-2.5">
                          Publish
                        </Button>
                      </form>
                    )}
                    <Link href={`/admin/videos/edit/${vid.id}`}>
                      <Button variant="outline" size="sm" className="font-semibold text-xs h-7 px-2.5 gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <form action={handleDelete.bind(null, vid.id)}>
                      <Button variant="ghost" size="sm" type="submit" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
