import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { serializeBigInt } from '@/lib/utils';
import { EditCategoryForm } from './EditCategoryForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const rawCategory = await prisma.category.findFirst({
    where: { id, deletedAt: null },
  });

  if (!rawCategory) {
    notFound();
  }

  const category = serializeBigInt(rawCategory);

  return (
    <div className="space-y-6">
      <EditCategoryForm category={category} />
    </div>
  );
}
