'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createVideo } from '@/features/videos/actions';
import { ArrowLeft, Loader2, Video } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().optional(),
  description: z.string().max(1000).optional(),
  videoUrl: z.string().url('Invalid video URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').or(z.literal('')).optional().nullable(),
  duration: z.coerce.number().int().positive().optional().nullable(),
  categoryId: z.string().uuid().or(z.literal('')).optional().nullable(),
  status: z.enum(['DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED']),
  isFeatured: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

interface NewVideoFormProps {
  categories: Array<{ id: string; name: string }>;
}

export function NewVideoForm({ categories }: NewVideoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'DRAFT',
      isFeatured: false,
      title: '',
      slug: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: null,
      categoryId: '',
    },
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const res = await createVideo({
        title: data.title,
        slug: data.slug?.trim() || undefined,
        description: data.description?.trim() || null,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        duration: data.duration || null,
        categoryId: !data.categoryId || data.categoryId === 'null' ? null : data.categoryId,
        status: data.status,
        isFeatured: data.isFeatured,
      });

      if (res.success) {
        toast.success('Video created successfully');
        router.push('/admin/videos');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create video story');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/videos"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Add Video Story</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Video Title</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Breaking: ISRO Launches New Satellite Navigation Fleet"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slug (Optional)</label>
              <input
                type="text"
                {...register('slug')}
                placeholder="e.g. isro-launches-new-satellite"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Write a brief overview of what this video contains..."
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 focus:outline-none resize-none"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Video Url */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Video Stream/Source URL (MP4 / HLS / YouTube)</label>
              <input
                type="text"
                {...register('videoUrl')}
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              {errors.videoUrl && <p className="text-xs text-red-500">{errors.videoUrl.message}</p>}
            </div>

            {/* Thumbnail URL & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thumbnail Image URL</label>
                <input
                  type="text"
                  {...register('thumbnailUrl')}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
                {errors.thumbnailUrl && <p className="text-xs text-red-500">{errors.thumbnailUrl.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration (Seconds)</label>
                <input
                  type="number"
                  {...register('duration')}
                  placeholder="300"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                />
                {errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  {...register('categoryId')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
                <select
                  {...register('status')}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Featured Switch */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeatured" {...register('isFeatured')} className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded" />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Mark as Featured Video (Shown on TV/Video pages)
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <Link href="/admin/videos">
                <Button variant="outline" type="button" disabled={isSubmitting} className="font-semibold">
                  Cancel
                </Button>
              </Link>
              <Button disabled={isSubmitting} type="submit" className="font-semibold gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Video Story
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
