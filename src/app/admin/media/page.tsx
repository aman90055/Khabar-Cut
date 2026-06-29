import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
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

  const where = {
    deletedAt: null,
    ...(type && type !== 'ALL' && { type: type as any }),
    ...(query && {
      OR: [
        { filename: { contains: query, mode: 'insensitive' as const } },
        { originalName: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [mediaItems, totalCount] = await Promise.all([
    prisma.media
      .findMany({
        where,
        include: { uploadedBy: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
      .catch(() => []),
    prisma.media.count({ where }).catch(() => 0),
  ]);

  const serializedMedia = serializeBigInt(mediaItems);
  const totalPages = Math.ceil(totalCount / pageSize);

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and upload files for articles and layouts.</p>
        </div>
        <Link href="/admin/media/upload">
          <Button className="font-semibold gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((t) => (
            <Link
              key={t}
              href={`/admin/media?type=${t}&q=${query}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                (type || 'ALL') === t
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase() + 's'}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search filename..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
          {type && <input type="hidden" name="type" value={type} />}
        </form>
      </div>

      {/* Grid */}
      {serializedMedia.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Image className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No media found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try changing filters or upload your first file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {serializedMedia.map((item: any) => (
            <Card key={item.id} className="group overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950">
              <div className="aspect-square w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                {item.type === 'IMAGE' ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                ) : item.type === 'VIDEO' ? (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-950">
                    <Video className="h-10 w-10 text-white/70" />
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                    <FileText className="h-10 w-10 text-zinc-400" />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate" title={item.filename}>
                  {item.originalName || item.filename}
                </p>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold">
                  <span>{formatBytes(Number(item.size))}</span>
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 border-none font-bold uppercase">
                    {item.type}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Link href={`/admin/media?type=${type}&q=${query}&page=${page - 1}`} className={page <= 1 ? 'pointer-events-none opacity-55' : ''}>
            <Button variant="outline" size="sm" className="font-semibold">Prev</Button>
          </Link>
          <span className="text-xs font-semibold text-zinc-500">Page {page} of {totalPages}</span>
          <Link href={`/admin/media?type=${type}&q=${query}&page=${page + 1}`} className={page >= totalPages ? 'pointer-events-none opacity-55' : ''}>
            <Button variant="outline" size="sm" className="font-semibold">Next</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
