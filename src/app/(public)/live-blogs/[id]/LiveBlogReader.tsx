'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Clock, Pin, Share2, Copy, Check, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface EntryItem {
  id: string;
  content: string;
  isPinned: boolean;
  entryType: string;
  createdAt: string;
  author: {
    displayName: string;
  };
}

interface LiveBlogReaderProps {
  blog: {
    id: string;
    title: string;
    description: string | null;
    status: 'ACTIVE' | 'PAUSED' | 'ENDED';
    startedAt: string;
    author: {
      displayName: string;
      avatarUrl: string | null;
    };
  };
  initialEntries: EntryItem[];
}

export function LiveBlogReader({ blog, initialEntries }: LiveBlogReaderProps) {
  const [entries, setEntries] = React.useState<EntryItem[]>(initialEntries);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchLatestUpdates = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/public/live-blogs/${blog.id}/entries`);
      if (res.ok) {
        const data = await res.json();
        if (data.entries) {
          setEntries(data.entries);
        }
      }
    } catch {
      // silent fail during polling
    } finally {
      setIsRefreshing(false);
    }
  };

  // Poll for updates every 15 seconds if active
  React.useEffect(() => {
    if (blog.status !== 'ACTIVE') return;

    const interval = setInterval(fetchLatestUpdates, 15000);
    return () => clearInterval(interval);
  }, [blog.status, blog.id]);

  const handleManualRefresh = () => {
    fetchLatestUpdates();
    toast.success('Feed re-synchronized');
  };

  const copyUpdateLink = (entryId: string) => {
    const url = `${window.location.origin}/live-blogs/${blog.id}#entry-${entryId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(entryId);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Separate pinned vs timeline entries
  const pinnedEntries = entries.filter((e) => e.isPinned);
  const timelineEntries = entries; // show all in chronological timeline

  return (
    <div className="space-y-8">
      {/* Blog Info Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            {blog.status === 'ACTIVE' ? (
              <Badge className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider gap-1 border-none py-1 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Live Coverage
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider border-none">
                Ended
              </Badge>
            )}
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Started {format(new Date(blog.startedAt), 'dd MMM yyyy HH:mm')}
            </span>
          </div>

          {blog.status === 'ACTIVE' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
                Auto-updates active
              </span>
              <Button variant="outline" size="sm" onClick={handleManualRefresh} className="h-7 text-xs font-bold px-2.5">
                Refresh Now
              </Button>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-tight">
          {blog.title}
        </h1>

        {blog.description && (
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
            {blog.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          {blog.author.avatarUrl && (
            <img src={blog.author.avatarUrl} alt={blog.author.displayName} className="h-8 w-8 rounded-full border shadow-sm" />
          )}
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{blog.author.displayName || 'Reporter Desk'}</p>
            <p className="text-[9px] text-zinc-400 font-black uppercase">Field Correspondent</p>
          </div>
        </div>
      </div>

      {/* Pinned Section */}
      {pinnedEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
            <Pin className="h-4 w-4 fill-amber-500" /> Pinned Key Updates
          </h2>
          <div className="space-y-3">
            {pinnedEntries.map((entry) => (
              <Card key={entry.id} className="border-2 border-amber-500/20 bg-amber-50/10 dark:bg-amber-950/5 relative overflow-hidden">
                <CardContent className="p-5 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                    Key Update
                  </span>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-relaxed">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Timeline */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Timeline of Events</h2>

        {timelineEntries.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            <p className="text-xs">No updates have been posted yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3.5 space-y-8 pl-6">
            {timelineEntries.map((entry) => {
              const timeString = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
              return (
                <div key={entry.id} id={`entry-${entry.id}`} className="relative space-y-2 group">
                  {/* Timeline point */}
                  <span className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full bg-red-600 ring-4 ring-white dark:ring-zinc-950" />

                  {/* Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 uppercase tracking-widest">{timeString}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{format(new Date(entry.createdAt), 'HH:mm')} IST</span>
                    </div>

                    <button
                      onClick={() => copyUpdateLink(entry.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 hover:text-red-500 transition-all cursor-pointer"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" /> Copied Link
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3 w-3" /> Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body text */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
