'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/features/auth/schemas';
import { signUp } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Extend registerSchema with client-side confirmPassword validation
const clientRegisterSchema = registerSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterInput>({
    resolver: zodResolver(clientRegisterSchema),
  });

  const onSubmit = async (data: ClientRegisterInput) => {
    setIsSubmitting(true);
    try {
      const res = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      if (res.success) {
        toast.success('Registration successful! Please sign in.');
        router.push('/login');
      } else {
        toast.error(res.error || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
          Create Account
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Join Khabar Cut to save articles and engage with comments
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            required
            {...register('fullName')}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-xs text-red-500 font-semibold">{errors.fullName.message}</p>
          )}
        </div>

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
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Password
          </label>
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

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            type="password"
            required
            {...register('confirmPassword')}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:placeholder-zinc-600"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold mt-2">
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#D90429] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
