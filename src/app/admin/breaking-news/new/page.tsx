'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createBreakingNews } from '@/features/breaking-news/actions';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(300),
  articleId: z.string().uuid().optional().nullable(),
  isActive: z.boolean(),
  priority: z.coerce.number().int().min(1).max(5),
  expiresAt: z.string().optional().nullable(),
});

type FormInput = z.infer<typeof schema>;

export default function NewBreakingNewsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [articles, setArticles] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
      priority: 1,
    },
  });

  const selectedArticleId = watch('articleId');

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setArticles([]);
      return;
    }
    const search = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(searchQuery)}&pageSize=5`);
        if (res.ok) {
          const json = await res.json();
          setArticles(json.data || []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(search, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      const res = await createBreakingNews(formattedData);
      if (res.success) {
        toast.success('Breaking news alert created');
        router.push('/admin/breaking-news');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create breaking news');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/breaking-news"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create Breaking Alert</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alert Text / Title</label>
              <textarea
                {...register('title')}
                rows={3}
                placeholder="Enter compelling breaking news text..."
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Link Article */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Link to Article (Optional)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {isSearching && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 p-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching articles...
                </div>
              )}

              {articles.length > 0 && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900/40">
                  {articles.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => {
                        setValue('articleId', art.id);
                        setSearchQuery(art.title);
                        setArticles([]);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {art.title}
                    </button>
                  ))}
                </div>
              )}

              {selectedArticleId && (
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Selected ID: {selectedArticleId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('articleId', null);
                      setSearchQuery('');
                    }}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>

            {/* Grid for priority and expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority (1-5)</label>
                <select
                  {...register('priority')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="1">1 (Lowest)</option>
                  <option value="2">2</option>
                  <option value="3">3 (Normal)</option>
                  <option value="4">4</option>
                  <option value="5">5 (Highest/Red Banner)</option>
                </select>
                {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
              </div>

              {/* Expires At */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  {...register('expiresAt')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-zinc-900 dark:text-zinc-50"
                />
                {errors.expiresAt && <p className="text-xs text-red-500">{errors.expiresAt.message}</p>}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded" />
              <label htmlFor="isActive" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Activate immediately on publish
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/breaking-news')}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit" className="font-semibold gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Alert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
