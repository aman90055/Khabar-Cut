'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, X, Loader2 } from 'lucide-react';
import { ArticleCard } from '@/components/articles/article-card';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  viewCount?: string;
  category?: { name: string; slug: string; color?: string | null } | null;
  author?: { fullName: string } | null;
  featuredImage?: { url: string; altText?: string | null } | null;
}

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const debouncedQuery = useDebounce(query, 400);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(debouncedQuery)}&pageSize=20`);
        const json = await res.json();
        setResults(json.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
    router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
  }, [debouncedQuery, router]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, categories..."
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-12 pr-12 py-4 text-base placeholder-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-semibold">Searching...</span>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${debouncedQuery}"`
                : `No results for "${debouncedQuery}"`}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">No articles found</h3>
                <p className="text-sm text-zinc-500 mt-1">Try different keywords or browse categories below.</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/')} className="font-semibold">
                Back to Home
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty / Initial state */}
      {!isLoading && !hasSearched && (
        <div className="text-center py-16 space-y-3">
          <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-semibold">Type something to search across all articles</p>
        </div>
      )}
    </div>
  );
}
