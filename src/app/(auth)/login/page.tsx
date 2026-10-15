'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schemas';
import type { LoginInput } from '@/features/auth/types';
import { signInWithEmail, signInWithOtp } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const [authType, setAuthType] = React.useState<'password' | 'otp'>('password');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpEmail, setOtpEmail] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get('redirectTo');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const res = await signInWithEmail(data);
      if (res.success) {
        toast.success('Successfully logged in!');
        const userRole = res.user?.role?.slug || 'reader';
        const destination = redirectToParam || (userRole !== 'reader' ? '/admin' : '/');
        router.push(destination);
        router.refresh();
      } else {
        toast.error(res.error || 'Login failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Email is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await signInWithOtp({ email: otpEmail });
      if (res.success) {
        toast.success('OTP sent to your email!');
        setOtpSent(true);
      } else {
        toast.error(res.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auth Type Switcher */}
      <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-850">
        <button
          type="button"
          onClick={() => setAuthType('password')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            authType === 'password'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setAuthType('otp')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            authType === 'otp'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          One-Time Passcode
        </button>
      </div>

      {authType === 'password' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#D90429] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-sm font-bold bg-[#D90429] hover:bg-red-700 text-white mt-2"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              disabled={otpSent}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
              placeholder="you@example.com"
            />
          </div>

          {otpSent ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center space-y-2 dark:bg-zinc-950 dark:border-zinc-850">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Check your inbox for a magic sign-in link.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOtpSent(false)}
                className="text-xs font-bold text-red-600 dark:text-red-500"
              >
                Change Email / Resend
              </Button>
            </div>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold mt-2">
              {isSubmitting ? 'Sending Link...' : 'Send Magic Link'}
            </Button>
          )}
        </form>
      )}

      <div className="text-center pt-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#D90429] hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-400">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
