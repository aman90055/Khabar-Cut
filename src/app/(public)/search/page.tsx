import * as React from 'react';
import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh] text-zinc-400">
        <span className="text-sm font-semibold">Loading search portal...</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
