import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .is('deleted_at', null)
      .order('group', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map snake_case to camelCase for backwards compatibility
    const formatted = (settings || []).map((s: any) => ({
      ...s,
      isPublic: s.is_public ?? false,
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json(); // Expected: Record<string, { value: any, group?: string, description?: string, isPublic?: boolean }>

    const entries = Object.entries(body);
    for (const [key, data] of entries as [string, any][]) {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('settings')
          .update({
            value: data.value,
            updated_at: new Date().toISOString(),
          })
          .eq('key', key);
      } else {
        await supabase
          .from('settings')
          .insert({
            key,
            value: data.value,
            group: data.group || 'general',
            description: data.description || null,
            is_public: data.isPublic ?? false,
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
