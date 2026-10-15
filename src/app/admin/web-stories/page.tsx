import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function WebStoriesAdminPage() {
  const supabase = await createClient();
  
  const { data: stories, error } = await supabase
    .from('web_stories')
    .select(`
      *,
      web_story_slides(count)
    `)
    .order('created_at', { ascending: false });

  const serializedStories = stories || [];

  async function handleDelete(id: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('web_stories').delete().eq('id', id);
    revalidatePath('/admin/web-stories');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Web Stories</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage mobile-first visual slides and stories.</p>
        </div>
        <Link href="/admin/web-stories/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Create Story
          </Button>
        </Link>
      </div>

      {/* Grid of stories */}
      {serializedStories.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Web Stories</h3>
          <p className="text-xs text-zinc-500 mt-1">Start creating your first mobile web story.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {serializedStories.map((story: any) => (
            <Card key={story.id} className="group overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <div className="aspect-[9/16] relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                {story.cover_image_url ? (
                  <img src={story.cover_image_url} alt={story.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                    <BookOpen className="h-12 w-12 text-zinc-700" />
                  </div>
                )}
                {/* Status */}
                <div className="absolute top-3 left-3">
                  <Badge className={`border-none font-bold text-[8px] uppercase ${
                    story.status === 'published'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-500 text-white'
                  }`}>
                    {story.status}
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2" title={story.title}>
                    {story.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Slides: {story.web_story_slides?.[0]?.count || 0}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 font-semibold">Editorial</span>
                  <form action={handleDelete.bind(null, story.id)}>
                    <Button variant="ghost" size="sm" type="submit" className="h-7 w-7 p-0 text-red-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
