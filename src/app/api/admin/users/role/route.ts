import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/middleware/rbac';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth();

    // Only Super Admin (level 0) or CEO can assign roles
    if (currentUser.role.slug !== 'super-admin' && currentUser.role.level !== 0) {
      return NextResponse.json({ error: 'Only Super Admin can change user roles' }, { status: 403 });
    }

    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'User ID and Role ID are required' }, { status: 400 });
    }

    const { data: updatedUser, error } = await adminSupabase
      .from('users')
      .update({
        role_id: roleId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*, role:role_id(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update role' }, { status: 500 });
  }
}
