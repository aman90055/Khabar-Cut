'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createWebStory } from '@/features/web-stories/actions';
import { MediaPicker } from '@/components/admin/media-picker';
import { ArrowLeft, Loader2, Plus, Trash2, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const slideSchema = z.object({
  imageUrl: z.string().url('Please choose an image'),
  text: z.string().max(300).optional().nullable(),
  link: z.string().url('Invalid CTA link').or(z.literal('')).optional().nullable(),
});

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  coverImage: z.string().url('Please choose a cover image').optional().nullable(),
  slides: z.array(slideSchema).min(1, 'A web story must have at least one slide'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

type FormInput = z.infer<typeof schema>;

export default function NewWebStoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pickerTarget, setPickerTarget] = React.useState<{ type: 'cover' | 'slide'; index?: number } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'DRAFT',
      slides: [{ imageUrl: '', text: '', link: '' }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'slides',
  });

  const coverImage = watch('coverImage');
  const slides = watch('slides');

  const onSubmit = async (data: FormInput) => {
    if (slides.some((s) => !s.imageUrl)) {
      toast.error('All slides must have an image chosen');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createWebStory(data);
      if (res.success) {
        toast.success('Web story created successfully');
        router.push('/admin/web-stories');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create web story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaSelect = (media: any) => {
    if (pickerTarget) {
      if (pickerTarget.type === 'cover') {
        setValue('coverImage', media.url);
      } else if (pickerTarget.type === 'slide' && typeof pickerTarget.index === 'number') {
        setValue(`slides.${pickerTarget.index}.imageUrl`, media.url);
      }
    }
    setPickerTarget(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/web-stories"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create Web Story</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main settings panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Story Title</label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="Enter the title for this Web Story..."
                    className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 placeholder-zinc-400 focus:outline-none"
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cover Image</label>
                  {coverImage ? (
                    <div className="relative aspect-video w-64 rounded-xl overflow-hidden border">
                      <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setValue('coverImage', '')}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPickerTarget({ type: 'cover' })}
                      className="w-64 h-32 flex flex-col items-center justify-center gap-2 border-dashed rounded-xl"
                    >
                      <ImageIcon className="h-6 w-6 text-zinc-400" />
                      <span className="text-xs">Choose Cover Image</span>
                    </Button>
                  )}
                  {errors.coverImage && <p className="text-xs text-red-500">{errors.coverImage.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Slides Builder */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Slides Timeline</h2>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => append({ imageUrl: '', text: '', link: '' })}
                  disabled={fields.length >= 15}
                  className="font-bold gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Slide ({fields.length}/15)
                </Button>
              </div>

              {fields.map((field, idx) => (
                <Card key={field.id} className="border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-4 flex gap-4">
                    {/* Index & Reorder controls */}
                    <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border">
                      <span className="text-xs font-bold text-zinc-500">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => idx > 0 && move(idx, idx - 1)}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => idx < fields.length - 1 && move(idx, idx + 1)}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Image picker */}
                    <div className="shrink-0">
                      {slides[idx]?.imageUrl ? (
                        <div className="relative aspect-[9/16] w-24 rounded-lg overflow-hidden border">
                          <img src={slides[idx].imageUrl} alt="Slide preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setValue(`slides.${idx}.imageUrl`, '')}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPickerTarget({ type: 'slide', index: idx })}
                          className="aspect-[9/16] w-24 h-40 flex flex-col items-center justify-center gap-1 border-dashed rounded-lg p-0"
                        >
                          <ImageIcon className="h-5 w-5 text-zinc-400" />
                          <span className="text-[10px]">Select Image</span>
                        </Button>
                      )}
                    </div>

                    {/* Slide Text overlay & Link */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Slide Text</label>
                        <textarea
                          {...register(`slides.${idx}.text`)}
                          rows={2}
                          placeholder="Slide overlay message..."
                          className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Call to Action Link (Optional)</label>
                        <input
                          type="text"
                          {...register(`slides.${idx}.link`)}
                          placeholder="https://example.com/read-more"
                          className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Remove button */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="self-start p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Publish Settings</h2>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
                  <select
                    {...register('status')}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <Button disabled={isSubmitting} type="submit" className="w-full font-bold gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Web Story
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPicker
          accept="IMAGE"
          onSelect={handleMediaSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}
