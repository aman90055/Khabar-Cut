import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Plus, Trash2, Edit, Play, Clock, Eye, Star } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

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

  const supabase = await createClient();

  let queryBuilder = supabase
    .from('videos')
    .select(`
      id, title, slug, video_url, thumbnail_url, duration,
      view_count, is_featured, status, created_at,
      category:categories!category_id (name),
      author:users!author_id (full_name)
    `)
    .is('deleted_at', null);

  if (status) {
    queryBuilder = queryBuilder.eq('status', status.toUpperCase());
  }

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,slug.ilike.%${query}%`);
  }

  const { data: rawVideos } = await queryBuilder.order('created_at', { ascending: false });

  const serializedVideos = (rawVideos || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    videoUrl: v.video_url,
    thumbnailUrl: v.thumbnail_url,
    duration: v.duration,
    viewCount: v.view_count || 0,
    isFeatured: v.is_featured,
    status: v.status,
    createdAt: v.created_at,
    category: v.category,
    author: {
      displayName: v.author?.full_name || 'Admin',
    },
  }));

  const formatDuration = (secs: number | null) => {
    if (!secs) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  async function handleDelete(id: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('videos').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    revalidatePath('/admin/videos');
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    'use server';
    const supabase = await createClient();
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await supabase.from('videos').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    revalidatePath('/admin/videos');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Videos</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage video news broadcasts, debate reels, and ground reports.</p>
        </div>
        <Link href="/admin/videos/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </div>

      {/* Grid of videos */}
      {serializedVideos.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Video className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Videos Found</h3>
          <p className="text-xs text-zinc-500 mt-1">Publish your first news video broadcast.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedVideos.map((video: any) => (
            <Card key={video.id} className="group overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <div>
                <div className="aspect-video relative bg-zinc-900 overflow-hidden flex items-center justify-center">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Play className="h-10 w-10 text-zinc-600" />
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {formatDuration(video.duration)}
                  </span>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className={`border-none font-bold text-[8px] uppercase ${
                      video.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-zinc-500 text-white'
                    }`}>
                      {video.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2" title={video.title}>
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                    <span>{video.category?.name || 'General'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.viewCount} views
                    </span>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2">
                <form action={handleToggleStatus.bind(null, video.id, video.status)}>
                  <Button variant="outline" size="sm" type="submit" className="text-xs h-8">
                    {video.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </Button>
                </form>
                <form action={handleDelete.bind(null, video.id)}>
                  <Button variant="ghost" size="sm" type="submit" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
