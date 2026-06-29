import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { LiveBlogReader } from './LiveBlogReader';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function LiveBlogDetailPage({ params }: PageParams) {
  const { id } = await params;

  const blog = await prisma.liveBlog.findFirst({
    where: { id, deletedAt: null },
    include: {
      author: { select: { displayName: true, avatarUrl: true } },
    },
  }).catch(() => null);

  if (!blog) {
    notFound();
  }

  // Fetch initial updates
  const entries = await prisma.liveBlogEntry.findMany({
    where: { liveBlogId: id, deletedAt: null },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedBlog = {
    ...serializeBigInt(blog),
    startedAt: blog.startedAt.toISOString(),
  };

  const serializedEntries = serializeBigInt(entries).map((entry: any) => ({
    ...entry,
    content: typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <LiveBlogReader blog={serializedBlog} initialEntries={serializedEntries} />
    </div>
  );
}
