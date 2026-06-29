'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createAd } from '@/features/advertisements/actions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  type: z.enum(['BANNER', 'SIDEBAR', 'INLINE', 'POPUP', 'NATIVE']),
  position: z.enum(['HEADER', 'SIDEBAR', 'ARTICLE_TOP', 'ARTICLE_BOTTOM', 'ARTICLE_INLINE', 'FOOTER', 'POPUP']),
  targetUrl: z.string().url('Invalid target URL').or(z.literal('')).optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').or(z.literal('')).optional().nullable(),
  content: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

export default function NewAdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
      type: 'BANNER',
      position: 'HEADER',
    },
  });

  const onSubmit = async (data: FormInput) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAd({
        title: data.title,
        type: data.type,
        position: data.position,
        targetUrl: data.targetUrl || null,
        imageUrl: data.imageUrl || null,
        content: data.content || null,
        startDate: start,
        endDate: end,
        isActive: data.isActive,
      });

      if (res.success) {
        toast.success('Ad campaign created successfully');
        router.push('/admin/advertisements');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ad campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/advertisements"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">New Campaign</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Campaign Title</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Summer Sale Banner 2026"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Grid for type & position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ad Type</label>
                <select
                  {...register('type')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                >
                  <option value="BANNER">Image Banner</option>
                  <option value="SIDEBAR">Sidebar Widget</option>
                  <option value="INLINE">Inline Text/Code</option>
                  <option value="POPUP">Popup Modal</option>
                  <option value="NATIVE">Native Sponsored Link</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Position</label>
                <select
                  {...register('position')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                >
                  <option value="HEADER">Header</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="ARTICLE_TOP">Article Top</option>
                  <option value="ARTICLE_BOTTOM">Article Bottom</option>
                  <option value="ARTICLE_INLINE">Article Inline</option>
                  <option value="FOOTER">Footer</option>
                  <option value="POPUP">Popup Overlay</option>
                </select>
              </div>
            </div>

            {/* Image URL & Target Link */}
            <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ad Image URL</label>
                <input
                  type="text"
                  {...register('imageUrl')}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Click Destination URL</label>
                <input
                  type="text"
                  {...register('targetUrl')}
                  placeholder="https://sponsor.com/landing-page"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
                {errors.targetUrl && <p className="text-xs text-red-500">{errors.targetUrl.message}</p>}
              </div>
            </div>

            {/* Custom Code block (AdSense / Scripts) */}
            <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Custom HTML / Script Code</label>
              <textarea
                {...register('content')}
                rows={3}
                placeholder="<!-- Paste AdSense code or third-party iframe script here -->"
                className="w-full text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 focus:outline-none resize-none"
              />
            </div>

            {/* Campaign dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/advertisements')}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit" className="font-semibold gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
