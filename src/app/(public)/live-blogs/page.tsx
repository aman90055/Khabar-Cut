import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function LiveBlogsPublicPage() {
  const blogs = await prisma.liveBlog.findMany({
    where: { deletedAt: null },
    include: {
      author: { select: { displayName: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedBlogs = serializeBigInt(blogs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 tracking-wider">
          <Radio className="h-4 w-4 animate-pulse" /> Real-time Coverage
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Khabar Cut Live Blogs
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Follow continuous, minute-by-minute updates on major developments, national elections, sports showdowns, and breaking news events.
        </p>
      </div>

      {/* Grid List */}
      {serializedBlogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <Radio className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Live Blogs Active</h3>
          <p className="text-xs text-zinc-500 mt-1">There are no live coverage blogs running at this hour. Check back shortly!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {serializedBlogs.map((blog: any) => (
            <Card key={blog.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    {blog.status === 'ACTIVE' ? (
                      <Badge className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider gap-1 border-none py-0.5 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        Live Coverage
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider border-none">
                        Ended
                      </Badge>
                    )}
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Started {format(new Date(blog.startedAt), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-snug hover:text-red-600 transition-colors">
                    <Link href={`/live-blogs/${blog.id}`}>
                      {blog.title}
                    </Link>
                  </h3>

                  {blog.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                      {blog.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase">
                    <span>By {blog.author?.displayName || 'Editorial Desk'}</span>
                    <span>•</span>
                    <span>{blog._count?.entries || 0} updates</span>
                  </div>
                </div>

                <Link href={`/live-blogs/${blog.id}`} className="shrink-0 w-full sm:w-auto">
                  <Button className="w-full sm:w-auto font-bold gap-2">
                    Follow Updates <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
