import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { EditCategoryForm } from './EditCategoryForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: rawCategory, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !rawCategory) {
    notFound();
  }

  const category = {
    id: rawCategory.id,
    name: rawCategory.name,
    slug: rawCategory.slug,
    description: rawCategory.description || null,
    parentId: rawCategory.parent_id || null,
    icon: rawCategory.icon || null,
    color: rawCategory.color || null,
    sortOrder: rawCategory.sort_order ?? 0,
    isActive: rawCategory.is_active ?? true,
  };

  return (
    <div className="space-y-6">
      <EditCategoryForm category={category} />
    </div>
  );
}
