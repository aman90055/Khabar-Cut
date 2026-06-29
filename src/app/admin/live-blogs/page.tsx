import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Plus, Trash2, StopCircle, PlayCircle, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { endLiveBlog, updateLiveBlog } from '@/features/live-blogs/actions';

export const dynamic = 'force-dynamic';

export default async function LiveBlogsAdminPage() {
  const blogs = await prisma.liveBlog.findMany({
    where: { deletedAt: null },
    include: {
      author: {
        include: {
          user: { select: { fullName: true } },
        },
      },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedBlogs = serializeBigInt(blogs);

  async function handleEnd(id: string) {
    'use server';
    await endLiveBlog(id);
  }

  async function handlePause(id: string) {
    'use server';
    await updateLiveBlog(id, { id, status: 'PAUSED' });
  }

  async function handleResume(id: string) {
    'use server';
    await updateLiveBlog(id, { id, status: 'ACTIVE' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Live Blogs</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage minute-by-minute news coverage and real-time commentary.</p>
        </div>
        <Link href="/admin/live-blogs/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Start Live Blog
          </Button>
        </Link>
      </div>

      {/* Grid of blogs */}
      {serializedBlogs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Radio className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Live Blogs</h3>
          <p className="text-xs text-zinc-500 mt-1">Get started by creating a new live blog event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serializedBlogs.map((blog: any) => (
            <Card key={blog.id} className="border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-1">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">{blog.description || 'No description provided.'}</p>
                  </div>
                  <Badge
                    className={`border-none font-bold uppercase text-[9px] px-2 py-0.5 shrink-0 flex items-center gap-1 ${
                      blog.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : blog.status === 'PAUSED'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {blog.status === 'ACTIVE' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {blog.status}
                  </Badge>
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-400 font-semibold border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
                  <span>Author: {blog.author?.displayName || 'Editorial'}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Started: {format(new Date(blog.startedAt || blog.createdAt), 'dd MMM HH:mm')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {blog._count?.entries || 0} updates
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Link href={`/admin/live-blogs/${blog.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold h-8">
                      Manage Updates
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    {blog.status === 'ACTIVE' && (
                      <form action={handlePause.bind(null, blog.id)}>
                        <Button variant="ghost" size="sm" type="submit" className="h-8 text-amber-500 hover:text-amber-600 font-semibold text-xs gap-1">
                          Pause
                        </Button>
                      </form>
                    )}
                    {blog.status === 'PAUSED' && (
                      <form action={handleResume.bind(null, blog.id)}>
                        <Button variant="ghost" size="sm" type="submit" className="h-8 text-emerald-500 hover:text-emerald-600 font-semibold text-xs gap-1">
                          Resume
                        </Button>
                      </form>
                    )}
                    {blog.status !== 'ENDED' && (
                      <form action={handleEnd.bind(null, blog.id)}>
                        <Button variant="ghost" size="sm" type="submit" className="h-8 text-red-500 hover:text-red-600 font-semibold text-xs gap-1">
                          End Blog
                        </Button>
                      </form>
                    )}
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
