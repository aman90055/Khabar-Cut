import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ data: null }, { status: 401 });
    }

    const { data: dbUser, error: dbError } = await adminSupabase
      .from('users')
      .select(`
        id, full_name, email, avatar_url, status,
        role:role_id ( id, name, slug )
      `)
      .eq('auth_id', user.id)
      .is('deleted_at', null)
      .single();

    if (dbError || !dbUser) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: dbUser.id,
        fullName: dbUser.full_name,
        email: dbUser.email,
        avatarUrl: dbUser.avatar_url,
        status: dbUser.status,
        role: dbUser.role,
      },
    });
  } catch (err) {
    console.error('Session route error:', err);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}
