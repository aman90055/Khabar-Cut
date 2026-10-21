import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, Video, FileText, Upload, Trash2, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface SearchParams {
  type?: string;
  page?: string;
  q?: string;
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const type = params.type || '';
  const page = Number(params.page) || 1;
  const query = params.q || '';
  const pageSize = 24;

  const supabase = await createClient();

  let queryBuilder = supabase
    .from('media')
    .select('*, uploaded_by:users!uploaded_by_id(full_name)', { count: 'exact' })
    .is('deleted_at', null);

  if (type && type !== 'ALL') {
    queryBuilder = queryBuilder.eq('type', type);
  }

  if (query) {
    queryBuilder = queryBuilder.or(`filename.ilike.%${query}%,original_name.ilike.%${query}%`);
  }

  const { data: mediaItems, count } = await queryBuilder
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalCount = count || 0;
  const serializedMedia = (mediaItems || []).map((m: any) => ({
    id: m.id,
    filename: m.filename,
    originalName: m.original_name,
    mimeType: m.mime_type,
    size: m.size,
    url: m.url,
    thumbnailUrl: m.thumbnail_url || m.url,
    altText: m.alt_text,
    type: m.type,
    createdAt: m.created_at,
    uploadedBy: {
      fullName: m.uploaded_by?.full_name || 'Admin',
    },
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-1">Browse and manage uploaded images, banners, and video assets.</p>
        </div>
        <Link href="/admin/media/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'IMAGE', 'VIDEO'].map((t) => (
            <Link key={t} href={`/admin/media?type=${t === 'ALL' ? '' : t}&q=${query}`}>
              <Button
                variant={type === t || (!type && t === 'ALL') ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {t}
              </Button>
            </Link>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <form method="GET">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search file name..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {type && <input type="hidden" name="type" value={type} />}
          </form>
        </div>
      </div>

      {/* Grid */}
      {serializedMedia.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Image className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Media Found</h3>
          <p className="text-xs text-zinc-500 mt-1">Upload files or try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {serializedMedia.map((item: any) => (
            <Card key={item.id} className="group overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                {item.type === 'IMAGE' ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <Video className="h-10 w-10 text-zinc-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span>{formatBytes(item.size)}</span>
                  <span>{format(new Date(item.createdAt), 'dd/MM/yy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500">
            Page {page} of {totalPages} ({totalCount} total assets)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/media?page=${page - 1}&type=${type}&q=${query}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/media?page=${page + 1}&type=${type}&q=${query}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
