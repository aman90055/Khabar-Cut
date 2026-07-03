import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: Request) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, color, sortOrder:sort_order')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Categories fetch error:', error.message);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: categories ?? [] });
  } catch (err) {
    console.error('Categories route error:', err);
    return NextResponse.json({ data: [] });
  }
}
