import { createClient } from '@/lib/supabase/server';
import { CategoriesTable } from './CategoriesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: rawCategories } = await supabase
    .from('categories')
    .select('id, name, slug, color, sort_order, is_active, parent_id')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  const categories = (rawCategories || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color || null,
    sortOrder: c.sort_order || 0,
    isActive: c.is_active ?? true,
    parent: null,
    _count: { articles: 0 },
  }));

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
