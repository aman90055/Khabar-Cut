'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
            कुछ गड़बड़ हुई (Something went wrong)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            पेज लोड करते समय एक समस्या आ गई। कृपया दोबारा प्रयास करें।
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white font-bold py-2.5"
          >
            <RotateCcw className="w-4 h-4" />
            पुनः लोड करें (Retry)
          </Button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            होमपेज पर जाएं (Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
