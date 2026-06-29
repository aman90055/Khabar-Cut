import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { StoryViewer } from './StoryViewer';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function WebStoryDetailPage({ params }: PageParams) {
  const { slug } = await params;

  const story = await prisma.webStory.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    include: {
      author: { select: { displayName: true } },
    },
  }).catch(() => null);

  if (!story) {
    notFound();
  }

  const serializedStory = serializeBigInt(story);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <StoryViewer story={serializedStory} />
    </div>
  );
}
