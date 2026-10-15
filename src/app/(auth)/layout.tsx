import * as React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Home } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors relative">
      {/* Liquid Glass Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-8 sm:left-8 glass p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300 z-50 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#D90429] dark:hover:text-[#D90429]"
        aria-label="Back to Home"
      >
        <Home className="w-6 h-6 stroke-[2]" />
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-6">
          <img
            src="/logo.png"
            alt="Khabar Cut Logo"
            className="h-20 w-auto object-contain mx-auto"
          />
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
