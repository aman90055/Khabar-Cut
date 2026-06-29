import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { EditVideoForm } from './EditVideoForm';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageParams) {
  const { id } = await params;

  const video = await prisma.video.findFirst({
    where: { id, deletedAt: null },
  }).catch(() => null);

  const categories = await prisma.category.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  if (!video) {
    notFound();
  }

  const serializedVideo = serializeBigInt(video);
  const serializedCategories = serializeBigInt(categories);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <EditVideoForm video={serializedVideo} categories={serializedCategories} />
    </div>
  );
}
