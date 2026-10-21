import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function LiveBlogsPublicPage() {
  const supabase = await createClient();

  const { data: rawBlogs } = await supabase
    .from('live_blogs')
    .select(`
      id, title, slug, description, status, started_at, created_at,
      author:authors!author_id (display_name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const serializedBlogs = (rawBlogs || []).map((b: any) => {
    const authorData: any = Array.isArray(b.author) ? b.author[0] : b.author;
    return {
      id: b.id,
      title: b.title,
      slug: b.slug,
      description: b.description,
      status: b.status,
      createdAt: b.created_at || b.started_at,
      author: {
        displayName: authorData?.display_name || 'खबर कट टीम',
      },
    };
  });

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
                        Archived
                      </Badge>
                    )}
                    <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(blog.createdAt), 'dd MMMM yyyy')}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug">
                    {blog.title}
                  </h2>

                  {blog.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {blog.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>Anchored by: <strong className="text-zinc-700 dark:text-zinc-300">{blog.author.displayName}</strong></span>
                  </div>
                </div>

                <Link href={`/live-blogs/${blog.id}`}>
                  <Button className="font-bold gap-2 shrink-0">
                    View Live Feed
                    <ArrowRight className="h-4 w-4" />
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
