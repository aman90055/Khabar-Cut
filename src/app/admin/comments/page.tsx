import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ShieldAlert, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { moderateComment, deleteComment } from '@/features/comments/actions';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
}

export default async function CommentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status || 'PENDING';

  const comments = await prisma.comment.findMany({
    where: { status: status as any, deletedAt: null },
    include: {
      user: { select: { fullName: true, email: true } },
      article: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedComments = serializeBigInt(comments);

  // Group counts for tabs
  const [pendingCount, approvedCount, spamCount] = await Promise.all([
    prisma.comment.count({ where: { status: 'PENDING', deletedAt: null } }).catch(() => 0),
    prisma.comment.count({ where: { status: 'APPROVED', deletedAt: null } }).catch(() => 0),
    prisma.comment.count({ where: { status: 'SPAM', deletedAt: null } }).catch(() => 0),
  ]);

  async function handleAction(id: string, newStatus: 'APPROVED' | 'REJECTED' | 'SPAM') {
    'use server';
    await moderateComment({ id, status: newStatus });
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteComment(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Comment Moderation</h1>
        <p className="text-sm text-zinc-500 mt-1">Review user discussions, approve comments, filter spam or delete inappropriate contributions.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-bold text-zinc-500 shrink-0">
        {[
          { id: 'PENDING', label: 'Pending', count: pendingCount },
          { id: 'APPROVED', label: 'Approved', count: approvedCount },
          { id: 'SPAM', label: 'Spam', count: spamCount },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/comments?status=${tab.id}`}
            className={`pb-3.5 border-b-2 transition-colors relative flex items-center gap-1.5 ${
              status === tab.id
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
            <Badge variant={status === tab.id ? 'default' : 'secondary'} className="text-[10px] font-bold px-1.5 py-0">
              {tab.count}
            </Badge>
          </Link>
        ))}
      </div>

      {/* List */}
      {serializedComments.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Comments</h3>
          <p className="text-xs text-zinc-500 mt-1">Queue is clear! No comments match the filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serializedComments.map((comment: any) => (
            <Card key={comment.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  {/* Meta detail */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                    <span className="text-zinc-700 dark:text-zinc-300">{comment.user?.fullName || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{comment.user?.email || ''}</span>
                    <span>•</span>
                    <span>{format(new Date(comment.createdAt), 'dd MMM HH:mm')}</span>
                    <span>•</span>
                    <span className="truncate max-w-xs font-bold text-red-500">
                      On: {comment.article?.title || 'Unknown Article'}
                    </span>
                  </div>
                  {/* Content body */}
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {comment.content}
                  </p>
                </div>

                {/* Moderate Actions */}
                <div className="flex items-center gap-2 md:self-center shrink-0">
                  {status === 'PENDING' && (
                    <>
                      <form action={handleAction.bind(null, comment.id, 'APPROVED')}>
                        <Button size="sm" type="submit" className="font-bold text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </form>
                      <form action={handleAction.bind(null, comment.id, 'SPAM')}>
                        <Button size="sm" variant="outline" type="submit" className="font-semibold text-xs h-8 gap-1 text-amber-500 border-amber-500/30 hover:bg-amber-50">
                          <ShieldAlert className="h-3.5 w-3.5" /> Spam
                        </Button>
                      </form>
                    </>
                  )}
                  {status === 'APPROVED' && (
                    <form action={handleAction.bind(null, comment.id, 'SPAM')}>
                      <Button size="sm" variant="outline" type="submit" className="font-semibold text-xs h-8 gap-1 text-amber-500 border-amber-500/30 hover:bg-amber-50">
                        <ShieldAlert className="h-3.5 w-3.5" /> Mark Spam
                      </Button>
                    </form>
                  )}
                  <form action={handleDelete.bind(null, comment.id)}>
                    <Button size="sm" variant="ghost" type="submit" className="h-8 text-red-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline Import Link mock since next/link is used
import Link from 'next/link';
