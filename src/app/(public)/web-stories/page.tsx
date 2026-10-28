import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

// Cache visual web stories on Vercel CDN with ISR revalidation every 60 seconds
export const revalidate = 60;

export default async function WebStoriesPublicPage() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from('web_stories')
    .select('*')
    .eq('status', 'PUBLISHED')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const serializedStories = stories || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 tracking-wider">
          <BookOpen className="h-4 w-4" /> Visual Stories
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          Khabar Cut Web Stories
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Swipe through bite-sized visual digests, infographic guides, and photo essays.
        </p>
      </div>

      {/* Grid Cards List */}
      {serializedStories.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Stories Active</h3>
          <p className="text-xs text-zinc-500 mt-1">There are no web stories published at this hour. Check back shortly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {serializedStories.map((story: any) => {
            let slideCount = 0;
            try {
              const slides = typeof story.slides === 'string' ? JSON.parse(story.slides) : story.slides;
              slideCount = Array.isArray(slides) ? slides.length : 0;
            } catch {
              // ignore
            }
            const cover = story.cover_image || story.cover_image_url;
            return (
              <Link key={story.id} href={`/web-stories/${story.slug}`}>
                <div className="group relative aspect-[9/16] w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-md cursor-pointer flex flex-col justify-end text-white hover:scale-[1.02] transition-all">
                  {cover && (
                    <img src={cover} alt={story.title} className="absolute inset-0 h-full w-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative p-4 space-y-2 z-10">
                    <Badge className="bg-red-600 border-none font-bold uppercase tracking-wider text-[8px] py-0.5">
                      {slideCount} slides
                    </Badge>
                    <h3 className="text-xs sm:text-sm font-extrabold leading-snug line-clamp-3 group-hover:underline">
                      {story.title}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
