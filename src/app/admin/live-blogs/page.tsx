import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Plus, Trash2, StopCircle, PlayCircle, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function LiveBlogsAdminPage() {
  const supabase = await createClient();

  const { data: rawBlogs } = await supabase
    .from('live_blogs')
    .select(`
      id, title, slug, description, status, started_at, created_at,
      author:authors!author_id (display_name),
      entries:live_blog_entries(count)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const serializedBlogs = (rawBlogs || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    description: b.description,
    status: b.status,
    createdAt: b.created_at || b.started_at,
    author: {
      displayName: b.author?.display_name || 'Admin',
    },
    _count: {
      entries: b.entries?.[0]?.count || 0,
    },
  }));

  async function handleEnd(id: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('live_blogs').update({ status: 'ENDED', ended_at: new Date().toISOString() }).eq('id', id);
    revalidatePath('/admin/live-blogs');
  }

  async function handlePause(id: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('live_blogs').update({ status: 'PAUSED', updated_at: new Date().toISOString() }).eq('id', id);
    revalidatePath('/admin/live-blogs');
  }

  async function handleResume(id: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('live_blogs').update({ status: 'ACTIVE', updated_at: new Date().toISOString() }).eq('id', id);
    revalidatePath('/admin/live-blogs');
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

      {/* Grid of live blogs */}
      {serializedBlogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Radio className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Live Blogs Active</h3>
          <p className="text-xs text-zinc-500 mt-1">Start your first live news event or match commentary.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serializedBlogs.map((blog: any) => (
            <Card key={blog.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`border-none font-bold uppercase text-[9px] ${
                      blog.status === 'ACTIVE'
                        ? 'bg-red-600 text-white animate-pulse'
                        : blog.status === 'PAUSED'
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-500 text-white'
                    }`}>
                      {blog.status}
                    </Badge>
                    <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(blog.createdAt), 'dd MMM yyyy, HH:mm')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {blog.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>Host: <strong className="text-zinc-700 dark:text-zinc-300">{blog.author.displayName}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {blog._count.entries} entries
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/live-blogs/${blog.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Public Feed
                    </Button>
                  </Link>

                  {blog.status === 'ACTIVE' && (
                    <form action={handlePause.bind(null, blog.id)}>
                      <Button variant="outline" size="sm" type="submit" className="text-xs">
                        <StopCircle className="h-3.5 w-3.5 mr-1" />
                        Pause
                      </Button>
                    </form>
                  )}

                  {blog.status === 'PAUSED' && (
                    <form action={handleResume.bind(null, blog.id)}>
                      <Button variant="outline" size="sm" type="submit" className="text-xs">
                        <PlayCircle className="h-3.5 w-3.5 mr-1" />
                        Resume
                      </Button>
                    </form>
                  )}

                  {blog.status !== 'ENDED' && (
                    <form action={handleEnd.bind(null, blog.id)}>
                      <Button variant="ghost" size="sm" type="submit" className="text-xs text-red-500 hover:text-red-600">
                        End Blog
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
