'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteCategory } from '@/features/categories/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  parent: { name: string } | null;
  _count: { articles: number };
}

interface CategoriesTableProps {
  categories: CategoryRow[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteCategory(id);
        if (res.success) {
          toast.success(`Category "${name}" deleted successfully`);
        } else {
          toast.error('Failed to delete category');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete category');
      }
    });
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No categories found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-semibold">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Slug</th>
            <th className="py-3 px-4">Parent Category</th>
            <th className="py-3 px-4 text-center">Articles</th>
            <th className="py-3 px-4 text-center">Color</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-center">Sort Order</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {categories.map((category) => (
            <tr
              key={category.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-50">
                {category.name}
              </td>
              <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                {category.slug}
              </td>
              <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                {category.parent?.name ?? <span className="text-zinc-300 dark:text-zinc-700">—</span>}
              </td>
              <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400">
                {category._count.articles}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center">
                  {category.color ? (
                    <span
                      className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-xs block"
                      style={{ backgroundColor: category.color }}
                      title={category.color}
                    />
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-700">—</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant={category.isActive ? 'success' : 'secondary'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400">
                {category.sortOrder}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/categories/edit/${category.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
