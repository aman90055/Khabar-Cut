'use server';

import { createClient } from '@/lib/supabase/server';
import { AuthService } from '@/server/services/auth-service';
import { createAuditLog } from '@/middleware/audit';
import { prisma } from '@/lib/prisma';
import { 
  loginSchema, 
  registerSchema, 
  otpSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  changePasswordSchema 
} from './schemas';
import type { 
  LoginInput, 
  RegisterInput, 
  OtpInput, 
  ForgotPasswordInput, 
  ResetPasswordInput,
  ChangePasswordInput 
} from './types';
import { headers } from 'next/headers';

export async function signInWithEmail(input: LoginInput) {
  try {
    const validated = loginSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error || !data.user || !data.session) {
      return { success: false, error: error?.message || 'Invalid email or password' };
    }

    const dbUser = await AuthService.handleAuthCallback(data.user);

    let userAgent = 'unknown';
    let ipAddress = '127.0.0.1';
    try {
      const headersList = await headers();
      userAgent = headersList.get('user-agent') || 'unknown';
      ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    } catch (headerError) {
      console.warn('⚠️ Could not extract headers for user login:', headerError);
    }

    // Log session in DB
    const session = await prisma.session.create({
      data: {
        userId: dbUser.id,
        tokenHash: data.session.access_token,
        expiresAt: new Date((data.session.expires_at ?? 0) * 1000),
        ipAddress,
        deviceInfo: userAgent ? { userAgent } : {},
      },
    });

    try {
      await createAuditLog({
        userId: dbUser.id,
        action: 'USER_LOGIN',
        entityType: 'session',
        entityId: session.id,
        newValues: { email: dbUser.email, ipAddress },
      });
    } catch (auditError) {
      console.warn('⚠️ Failed to create audit log for user login:', auditError);
    }

    return { success: true, user: dbUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function signUp(input: RegisterInput) {
  try {
    const validated = registerSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName,
        },
      },
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Registration failed' };
    }

    const dbUser = await AuthService.handleAuthCallback(data.user);

    try {
      await createAuditLog({
        userId: dbUser.id,
        action: 'USER_REGISTER',
        entityType: 'user',
        entityId: dbUser.id,
        newValues: { email: dbUser.email },
      });
    } catch (auditError) {
      console.warn('⚠️ Failed to create audit log for user registration:', auditError);
    }

    return { success: true, user: dbUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function signInWithOtp(input: ForgotPasswordInput) {
  try {
    const validated = forgotPasswordSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: validated.email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function verifyOtp(input: OtpInput) {
  const validated = otpSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email: validated.email,
    token: validated.otp,
    type: 'email',
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'OTP verification failed');
  }

  const dbUser = await AuthService.handleAuthCallback(data.user);

  return { success: true, user: dbUser };
}

export async function signOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (dbUser) {
      await prisma.session.updateMany({
        where: { userId: dbUser.id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await createAuditLog({
        userId: dbUser.id,
        action: 'USER_LOGOUT',
        entityType: 'user',
        entityId: dbUser.id,
      });
    }
  }

  await supabase.auth.signOut();
  return { success: true };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const validated = forgotPasswordSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function resetPassword(input: ResetPasswordInput) {
  const validated = resetPasswordSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: validated.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function changePassword(input: ChangePasswordInput) {
  const validated = changePasswordSchema.parse(input);
  const supabase = await createClient();

  // Supabase lets us update password of currently active session
  const { error } = await supabase.auth.updateUser({
    password: validated.newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
