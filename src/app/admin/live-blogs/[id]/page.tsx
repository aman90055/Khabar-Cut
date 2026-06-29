'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Pin, Trash2, Send, Clock, Play, Pause, Square } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/utils/date';

const entrySchema = z.object({
  content: z.string().min(1, 'Update text cannot be empty'),
  entryType: z.string(),
  isPinned: z.boolean(),
});

type EntryInput = z.infer<typeof entrySchema>;

export default function LiveBlogConsolePage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = React.useState<any>(null);
  const [entries, setEntries] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPosting, setIsPosting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      entryType: 'update',
      isPinned: false,
    },
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/live-blogs/${blogId}`);
      if (res.ok) {
        const json = await res.json();
        setBlog(json.blog);
        setEntries(json.entries || []);
      }
    } catch {
      toast.error('Failed to load live blog updates');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [blogId]);

  const onSubmit = async (data: EntryInput) => {
    setIsPosting(true);
    try {
      const res = await fetch(`/api/admin/live-blogs/${blogId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { blocks: [{ type: 'paragraph', data: { text: data.content } }] },
          entryType: data.entryType,
          isPinned: data.isPinned,
        }),
      });

      if (res.ok) {
        toast.success('Update published');
        reset();
        fetchData();
      } else {
        throw new Error('Failed to post entry');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post update');
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'ACTIVE' | 'PAUSED' | 'ENDED') => {
    try {
      const res = await fetch(`/api/admin/live-blogs/${blogId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    try {
      const res = await fetch(`/api/admin/live-blogs/entries/${entryId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Update deleted');
        fetchData();
      }
    } catch {
      toast.error('Failed to delete update');
    }
  };

  const handleTogglePin = async (entryId: string, currentPin: boolean) => {
    try {
      const res = await fetch(`/api/admin/live-blogs/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPin }),
      });
      if (res.ok) {
        toast.success(!currentPin ? 'Update pinned' : 'Update unpinned');
        fetchData();
      }
    } catch {
      toast.error('Failed to pin/unpin update');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold">Loading live blog console...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Live blog not found</h2>
        <Link href="/admin/live-blogs" className="mt-4 inline-block text-red-500 hover:underline">
          Back to Live Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/live-blogs"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-md">
            {blog.title}
          </h1>
        </div>

        {/* Status indicator + controls */}
        <div className="flex items-center gap-3">
          <Badge
            className={`border-none font-bold uppercase text-[9px] px-2 py-0.5 shrink-0 flex items-center gap-1 ${
              blog.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : blog.status === 'PAUSED'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {blog.status === 'ACTIVE' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {blog.status}
          </Badge>

          <div className="flex items-center border rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
            {blog.status !== 'ACTIVE' && (
              <button
                onClick={() => handleToggleStatus('ACTIVE')}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 border-r"
                title="Resume/Start Live Coverage"
              >
                <Play className="h-4 w-4 fill-emerald-600" />
              </button>
            )}
            {blog.status === 'ACTIVE' && (
              <button
                onClick={() => handleToggleStatus('PAUSED')}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-amber-500 border-r"
                title="Pause Live Coverage"
              >
                <Pause className="h-4 w-4 fill-amber-500" />
              </button>
            )}
            {blog.status !== 'ENDED' && (
              <button
                onClick={() => handleToggleStatus('ENDED')}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-red-600"
                title="End Live Blog"
              >
                <Square className="h-4 w-4 fill-red-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: post update */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Compose Update</CardTitle>
            </CardHeader>
            <CardContent>
              {blog.status === 'ENDED' ? (
                <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                  This live blog has ended. Re-activate to post updates.
                </p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Content */}
                  <div className="space-y-1.5">
                    <textarea
                      {...register('content')}
                      rows={4}
                      placeholder="Type the live update content..."
                      className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none text-zinc-900 dark:text-zinc-50"
                    />
                    {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                  </div>

                  {/* Options */}
                  <div className="flex justify-between items-center gap-4">
                    {/* Pin toggle */}
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isPinned" {...register('isPinned')} className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded" />
                      <label htmlFor="isPinned" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <Pin className="h-3.5 w-3.5" />
                        Pin update
                      </label>
                    </div>

                    {/* Entry type */}
                    <select
                      {...register('entryType')}
                      className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="update">Normal Update</option>
                      <option value="breaking">Breaking Alert</option>
                      <option value="media">Media Update</option>
                    </select>
                  </div>

                  {/* Send Button */}
                  <Button disabled={isPosting} type="submit" className="w-full font-bold gap-2">
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish Update
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: entries timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Timeline Updates ({entries.length})</h2>

          {entries.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
              <Clock className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <h3 className="text-sm font-bold mt-3 text-zinc-800 dark:text-zinc-200">No updates yet</h3>
              <p className="text-xs text-zinc-500 mt-1">Updates will show up here as soon as you publish them.</p>
            </div>
          ) : (
            <div className="space-y-4 relative pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-3">
              {entries.map((entry) => {
                const text = entry.content?.blocks?.[0]?.data?.text || '';
                return (
                  <div key={entry.id} className="relative space-y-2 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {/* Circle marker */}
                    <div className="absolute -left-[22px] top-4 h-3 w-3 rounded-full border-2 border-white bg-red-600 dark:border-zinc-950" />

                    {/* Meta */}
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                        <span>{entry.author?.displayName || 'Editorial'}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(new Date(entry.createdAt))}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(entry.id, entry.isPinned)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            entry.isPinned
                              ? 'text-red-500 bg-red-50/50 dark:bg-red-950/20'
                              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                          }`}
                          title="Pin update to top"
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                          title="Delete update"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
