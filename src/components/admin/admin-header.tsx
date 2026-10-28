'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from '@/features/auth/actions';

export function AdminHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2 font-black text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-[#D90429] text-white flex items-center justify-center font-black text-sm shadow">
            KC
          </span>
          <span>
            Khabar Cut <span className="text-[#D90429] font-normal text-xs uppercase tracking-widest ml-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md font-bold">Admin Workspace</span>
          </span>
        </Link>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#D90429] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 px-3 py-1.5 rounded-lg transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>वेबसाइट देखें (Live Site)</span>
        </Link>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D90429] to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AV
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Aman Vishwakarma
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Super Admin
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="ml-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            title="लॉग आउट (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
