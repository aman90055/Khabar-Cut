import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { NewVideoForm } from './NewVideoForm';

export const dynamic = 'force-dynamic';

export default async function NewVideoPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  const serializedCategories = serializeBigInt(categories);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NewVideoForm categories={serializedCategories} />
    </div>
  );
}
