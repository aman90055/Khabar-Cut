'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ShieldAlert, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CommentsAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || 'pending';
  
  const [comments, setComments] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  
  // We'll mock the counts for tabs based on current fetch, or just show total for active tab
  const [counts, setCounts] = React.useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  });

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${status}`);
      const data = await res.json();
      setComments(data.data || []);
      setCount(data.count || 0);
      setCounts(prev => ({ ...prev, [status]: data.count || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'spam', label: 'Spam' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Comment Moderation</h1>
        <p className="text-sm text-zinc-500 mt-1">Review user discussions, approve comments, filter spam or delete inappropriate contributions.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-bold text-zinc-500 shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(`/admin/comments?status=${tab.id}`)}
            className={`pb-3.5 border-b-2 transition-colors relative flex items-center gap-1.5 whitespace-nowrap ${
              status === tab.id
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
            <Badge variant={status === tab.id ? 'default' : 'secondary'} className="text-[10px] font-bold px-1.5 py-0">
              {status === tab.id ? count : counts[tab.id as keyof typeof counts]}
            </Badge>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">कोई कमेंट नहीं</h3>
          <p className="text-xs text-zinc-500 mt-1">Queue is clear! No comments match the filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <Card key={comment.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  {/* Meta detail */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                    <span className="text-zinc-700 dark:text-zinc-300">{comment.author_name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{comment.author_email || 'No email'}</span>
                    <span>•</span>
                    <span>{comment.created_at ? format(new Date(comment.created_at), 'dd MMM HH:mm') : ''}</span>
                    <span>•</span>
                    <Link href={`/article/${comment.article?.slug}`} className="truncate max-w-xs font-bold text-red-500 hover:underline">
                      On: {comment.article?.title || 'Unknown Article'}
                    </Link>
                  </div>
                  {/* Content body */}
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {comment.body}
                  </p>
                </div>

                {/* Moderate Actions */}
                <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                  {status !== 'approved' && (
                    <Button onClick={() => handleAction(comment.id, 'approved')} size="sm" className="font-bold text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {status !== 'rejected' && (
                    <Button onClick={() => handleAction(comment.id, 'rejected')} size="sm" variant="outline" className="font-semibold text-xs h-8 gap-1 text-red-500 border-red-500/30 hover:bg-red-50">
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                  {status !== 'spam' && (
                    <Button onClick={() => handleAction(comment.id, 'spam')} size="sm" variant="outline" className="font-semibold text-xs h-8 gap-1 text-orange-500 border-orange-500/30 hover:bg-orange-50">
                      <ShieldAlert className="h-3.5 w-3.5" /> Spam
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(comment.id)} size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
