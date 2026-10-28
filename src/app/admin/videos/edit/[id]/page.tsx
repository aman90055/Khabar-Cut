import * as React from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { EditVideoForm } from './EditVideoForm';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageParams) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [videoRes, catRes] = await Promise.all([
    supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id, name')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ]);

  const rawVideo = videoRes.data;
  if (!rawVideo) {
    notFound();
  }

  const video = {
    id: rawVideo.id,
    title: rawVideo.title,
    slug: rawVideo.slug,
    description: rawVideo.description || null,
    videoUrl: rawVideo.video_url,
    thumbnailUrl: rawVideo.thumbnail_url || null,
    duration: rawVideo.duration || null,
    categoryId: rawVideo.category_id || null,
    status: (rawVideo.status || 'DRAFT') as 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: rawVideo.is_featured ?? false,
  };

  const categories = (catRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <EditVideoForm video={video} categories={categories} />
    </div>
  );
}
