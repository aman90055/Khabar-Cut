import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const adminSupabase = createAdminClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';

    let queryBuilder = adminSupabase
      .from('media')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(40);

    if (type && type !== 'ALL') {
      queryBuilder = queryBuilder.eq('type', type);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`filename.ilike.%${query}%,original_name.ilike.%${query}%`);
    }

    const { data: mediaItems, error } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: mediaItems || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
