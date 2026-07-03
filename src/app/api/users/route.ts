import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = 50;
    const search = searchParams.get('search') ?? undefined;
    const roleFilter = searchParams.get('role') ?? undefined;

    let query = supabase
      .from('users')
      .select(`
        id, full_name, email, avatar_url, status, created_at,
        role:role_id ( id, name, slug )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query;

    if (error) {
      console.error('Users fetch error:', error.message);
      return NextResponse.json({ data: [], meta: { total: 0 } });
    }

    let filtered = users ?? [];
    if (roleFilter) {
      filtered = filtered.filter((u: Record<string, unknown>) => {
        const role = u.role as { slug?: string } | null;
        return role?.slug === roleFilter;
      });
    }

    return NextResponse.json({
      data: filtered,
      meta: { total: count ?? 0, page, pageSize },
    });
  } catch (err) {
    console.error('Users route error:', err);
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }
}
