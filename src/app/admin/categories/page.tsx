import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { CategoriesTable } from './CategoriesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const rawCategories = await prisma.category
    .findMany({
      where: { deletedAt: null },
      include: {
        parent: { select: { name: true } },
        _count: { select: { articles: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })
    .catch(() => []);

  const categories = serializeBigInt(rawCategories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Categories
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your news platform categories and hierarchy.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
