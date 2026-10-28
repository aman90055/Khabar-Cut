'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
            एडमिन पैनल लोड नहीं हो सका
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            हो सकता है आपका लॉगिन सत्र समाप्त हो गया हो या अनुमति की आवश्यकता हो।
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login?redirectTo=/admin"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#D90429] hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            पुनः लॉगिन करें (Login)
          </Link>
          <Button
            onClick={() => reset()}
            variant="outline"
            className="w-full gap-2 rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
            दोबारा प्रयास करें (Retry)
          </Button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold py-2 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            होमपेज पर वापस जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}
