'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schemas';
import type { LoginInput } from '@/features/auth/types';
import { signInWithEmail, signInWithOtp } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [authType, setAuthType] = React.useState<'password' | 'otp'>('password');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpEmail, setOtpEmail] = React.useState('');

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
        router.push('/');
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
      {/* Tabs */}
      <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setAuthType('password')}
          className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-all cursor-pointer ${
            authType === 'password'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setAuthType('otp')}
          className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-all cursor-pointer ${
            authType === 'otp'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
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
              type="email"
              required
              {...register('email')}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              {...register('password')}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold mt-2">
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
