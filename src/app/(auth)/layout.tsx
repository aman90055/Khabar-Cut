import * as React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-4xl font-black tracking-tight text-red-600 bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 px-5 py-2 rounded-xl mb-6">
          KC
        </Link>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Welcome to {siteConfig.name}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your source for verified, real-time news updates
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-8 px-4 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
