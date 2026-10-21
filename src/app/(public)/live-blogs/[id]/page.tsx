import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { LiveBlogReader } from './LiveBlogReader';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function LiveBlogDetailPage({ params }: PageParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog } = await supabase
    .from('live_blogs')
    .select(`
      id, title, slug, description, status, started_at, created_at,
      author:authors!author_id (display_name, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!blog) {
    notFound();
  }

  // Fetch initial updates
  const { data: rawEntries } = await supabase
    .from('live_blog_entries')
    .select(`
      id, live_blog_id, content, created_at
    `)
    .eq('live_blog_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const authorData: any = Array.isArray(blog.author) ? blog.author[0] : blog.author;

  const serializedBlog = {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.description,
    status: blog.status,
    startedAt: blog.started_at ? new Date(blog.started_at).toISOString() : new Date().toISOString(),
    author: {
      displayName: authorData?.display_name || 'खबर कट टीम',
      avatarUrl: authorData?.avatar_url || null,
    },
  };

  const serializedEntries = (rawEntries || []).map((entry: any) => ({
    id: entry.id,
    content: typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content),
    isPinned: Boolean(entry.is_pinned),
    entryType: entry.entry_type || 'STANDARD',
    createdAt: entry.created_at,
    author: {
      displayName: 'खबर कट टीम',
    },
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <LiveBlogReader blog={serializedBlog} initialEntries={serializedEntries} />
    </div>
  );
}
