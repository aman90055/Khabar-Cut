import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DistrictsManager } from './DistrictsManager';

export const dynamic = 'force-dynamic';

export default async function DistrictsAdminPage() {
  const supabase = await createClient();

  const [districtsRes, statesRes] = await Promise.all([
    supabase
      .from('districts')
      .select('id, name, slug, state_id, is_active, sort_order, state:states!state_id(name)')
      .is('deleted_at', null)
      .order('name', { ascending: true }),
    supabase
      .from('states')
      .select('id, name')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ]);

  const serializedDistricts = (districtsRes.data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    stateId: d.state_id,
    isActive: d.is_active ?? true,
    sortOrder: d.sort_order || 0,
    state: {
      name: d.state?.name || 'N/A',
    },
    _count: {
      articles: 0,
    },
  }));

  const serializedStates = (statesRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <div className="space-y-6">
      <DistrictsManager initialDistricts={serializedDistricts} states={serializedStates} />
    </div>
  );
}
