import * as React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-16 space-y-8">
      <div className="space-y-2">
        <p className="text-8xl font-black text-red-600 tracking-tight">404</p>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Page not found</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          The article or page you were looking for has been moved, deleted, or may never have existed.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button className="font-bold gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="font-bold gap-2">
            Search Articles
          </Button>
        </Link>
      </div>
    </div>
  );
}
