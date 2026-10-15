import { ROLE_PERMISSIONS } from '@/config/permissions';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AuthService {
  public static async handleAuthCallback(supabaseUser: SupabaseUser) {
    const email = supabaseUser.email!;
    const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Reader';
    const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

    let { data: readerRole } = await adminSupabase
      .from('roles')
      .select('id')
      .eq('slug', 'reader')
      .single();

    if (!readerRole) {
      const { data: newRole } = await adminSupabase
        .from('roles')
        .insert({
          id: randomUUID(),
          name: 'Reader',
          slug: 'reader',
          description: 'Default reader role',
          level: 100,
          is_system: true,
        })
        .select('id')
        .single();
      readerRole = newRole;
    }

    // Ensure readerRole is defined
    if (!readerRole) {
      throw new Error('Failed to obtain reader role');
    }

    let { data: existingUser } = await adminSupabase
      .from('users')
      .select('*')
      .eq('auth_id', supabaseUser.id)
      .single();

    if (!existingUser) {
      const { data: existingUserByEmail } = await adminSupabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      existingUser = existingUserByEmail;
    }

    let user;

    if (existingUser) {
      const { data: updatedUser, error: updateError } = await adminSupabase
        .from('users')
        .update({
          auth_id: supabaseUser.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select(`*, role:role_id(*)`)
        .single();
        
      if (updateError) {
        console.error('Update User Error:', updateError);
        throw new Error(updateError.message);
      }
      user = updatedUser;
    } else {
      const { data: newUser, error: insertError } = await adminSupabase
        .from('users')
        .insert({
          id: randomUUID(),
          auth_id: supabaseUser.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          auth_provider: supabaseUser.app_metadata.provider || 'email',
          role_id: readerRole.id,
          is_active: true,
          is_verified: !!supabaseUser.email_confirmed_at,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`*, role:role_id(*)`)
        .single();
        
      if (insertError) {
        console.error('Insert User Error:', insertError);
        throw new Error(insertError.message);
      }
      user = newUser;
    }

    if (!user) {
      throw new Error('Failed to create or update user record in database');
    }

    // Format properties exactly as expected by legacy Prisma return format
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      authProvider: user.auth_provider,
      authId: user.auth_id,
      roleId: user.role_id,
      isActive: user.is_active,
      isVerified: user.is_verified,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
      role: Array.isArray(user.role) ? user.role[0] : user.role,
    };
  }

  public static async getUserWithPermissions(userId: string) {
    const { data: user } = await adminSupabase
      .from('users')
      .select(`*, role:role_id(*)`)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (!user) {
      return null;
    }

    const formattedRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const roleSlug = formattedRole?.slug || 'reader';
    const permissions = ROLE_PERMISSIONS[roleSlug as keyof typeof ROLE_PERMISSIONS] || [];

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      authProvider: user.auth_provider,
      authId: user.auth_id,
      roleId: user.role_id,
      isActive: user.is_active,
      isVerified: user.is_verified,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
      role: formattedRole,
      permissions,
    };
  }
}
