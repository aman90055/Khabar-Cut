import * as React from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { NewVideoForm } from './NewVideoForm';

export const dynamic = 'force-dynamic';

export default async function NewVideoPage() {
  const supabase = createAdminClient();

  const { data: rawCategories } = await supabase
    .from('categories')
    .select('id, name')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name', { ascending: true });

  const categories = (rawCategories || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NewVideoForm categories={categories} />
    </div>
  );
}
