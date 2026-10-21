import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { StatesManager } from './StatesManager';

export const dynamic = 'force-dynamic';

export default async function StatesAdminPage() {
  const supabase = await createClient();

  const { data: rawStates } = await supabase
    .from('states')
    .select(`
      id, name, code, slug, sort_order, is_active,
      districts:districts(count)
    `)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  const states = (rawStates || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    slug: s.slug,
    sortOrder: s.sort_order || 0,
    isActive: s.is_active ?? true,
    _count: {
      districts: s.districts?.[0]?.count || 0,
      articles: 0,
    },
  }));

  return (
    <div className="space-y-6">
      <StatesManager initialStates={states} />
    </div>
  );
}
