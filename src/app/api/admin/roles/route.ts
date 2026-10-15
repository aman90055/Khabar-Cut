import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('id, name, slug, level')
      .order('level', { ascending: true });

    if (error) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: roles ?? [] });
  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}
