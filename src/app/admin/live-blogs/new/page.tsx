'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createLiveBlog } from '@/features/live-blogs/actions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ENDED']),
});

type FormInput = z.infer<typeof schema>;

export default function NewLiveBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const res = await createLiveBlog(data);
      if (res.success) {
        toast.success('Live blog created');
        router.push(`/admin/live-blogs/${res.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create live blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/live-blogs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Start Live Blog</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Blog Title / Event Name</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Union Budget 2026 Live Updates"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-zinc-900 dark:text-zinc-50"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Short Description / Subtitle</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe what coverage this live blog provides..."
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none text-zinc-900 dark:text-zinc-50"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Initial Status</label>
              <select
                {...register('status')}
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value="ACTIVE">Active (Accepts updates, public live marker)</option>
                <option value="PAUSED">Paused (Temporary hold)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/live-blogs')}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit" className="font-semibold gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Blog
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
