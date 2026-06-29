'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const commentSchema = z.object({
  content: z.string().min(3, 'Comment must be at least 3 characters').max(2000),
});
type CommentInput = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  status: string;
  user?: { fullName: string; avatarUrl?: string | null } | null;
  replies?: Comment[];
  parentId?: string | null;
}

interface CommentSectionProps {
  articleId: string;
  initialComments?: Comment[];
}

export function CommentSection({ articleId, initialComments = [] }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = React.useState<Comment[]>(
    initialComments.filter(c => !c.parentId)
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentInput) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      toast.success('Comment submitted for moderation');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Comments {comments.length > 0 && <span className="text-zinc-400 font-normal text-base">({comments.length})</span>}
        </h2>
      </div>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 shrink-0 mt-1">
              {user?.user_metadata?.full_name?.[0] ?? 'U'}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                {...register('content')}
                rows={3}
                placeholder="Share your thoughts on this article..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm placeholder-zinc-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
              />
              {errors.content && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.content.message}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center space-y-3 bg-zinc-50 dark:bg-zinc-900">
          <MessageSquare className="h-8 w-8 text-zinc-400 mx-auto" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-semibold">
            Sign in to join the discussion
          </p>
          <Link href="/login">
            <Button size="sm" className="font-bold">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments list */}
      <AnimatePresence>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm font-semibold">
            Be the first to comment on this article.
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                  {comment.user?.fullName?.[0] ?? 'U'}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {comment.user?.fullName ?? 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {comment.status === 'PENDING' && (
                      <Badge variant="secondary" className="text-[10px] font-bold">Pending</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
