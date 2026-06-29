'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createCategory } from '@/features/categories/actions';
import { Button } from '@/components/ui/button';

// Client-side schema to resolve strict react-hook-form types
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  parentId: z.string().uuid().or(z.literal('')).optional().nullable(),
  sortOrder: z.coerce.number().int(),
  isActive: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

interface CategoryOption {
  id: string;
  name: string;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      icon: '',
      color: '#3b82f6',
      sortOrder: 0,
      isActive: true,
    },
  });

  const colorValue = watch('color') || '#3b82f6';

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data.data ?? [];
        setCategories(cats);
      })
      .catch(() => {
        toast.error('Failed to load active categories');
      })
      .finally(() => {
        setIsLoadingCats(false);
      });
  }, []);

  const onSubmit = (data: FormInput) => {
    const payload = {
      name: data.name,
      slug: data.slug?.trim() || undefined,
      description: data.description?.trim() || null,
      icon: data.icon?.trim() || null,
      color: data.color || null,
      parentId: !data.parentId || data.parentId === 'null' ? null : data.parentId,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };

    startTransition(async () => {
      try {
        const res = await createCategory(payload);
        if (res.success) {
          toast.success('Category created successfully!');
          router.push('/admin/categories');
        } else {
          toast.error('Failed to create category');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to create category');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back to list */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Create New Category</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add a new article category to organize content.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="e.g. Technology"
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label htmlFor="slug" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Slug (Optional)
              </label>
              <input
                id="slug"
                type="text"
                {...register('slug')}
                placeholder="e.g. technology"
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200"
              />
              {errors.slug && (
                <p className="text-xs text-red-500 mt-0.5">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Provide a description for this category..."
              className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-0.5">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Category */}
            <div className="space-y-1">
              <label htmlFor="parentId" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Parent Category
              </label>
              <select
                id="parentId"
                {...register('parentId')}
                disabled={isLoadingCats}
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200"
              >
                <option value="">None (Top Level)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="text-xs text-red-500 mt-0.5">{errors.parentId.message}</p>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-1">
              <label htmlFor="icon" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Lucide Icon Name
              </label>
              <input
                id="icon"
                type="text"
                {...register('icon')}
                placeholder="e.g. Laptop"
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200"
              />
              {errors.icon && (
                <p className="text-xs text-red-500 mt-0.5">{errors.icon.message}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1">
              <label htmlFor="color" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Color Swatch
              </label>
              <div className="flex gap-2">
                <input
                  id="color-picker"
                  type="color"
                  value={colorValue}
                  onChange={(e) => {
                    setValue('color', e.target.value);
                  }}
                  className="w-9 h-9 p-0 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                />
                <input
                  id="color"
                  type="text"
                  {...register('color')}
                  placeholder="#3b82f6"
                  className="flex-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200"
                />
              </div>
              {errors.color && (
                <p className="text-xs text-red-500 mt-0.5">{errors.color.message}</p>
              )}
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label htmlFor="sortOrder" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Sort Order
              </label>
              <input
                id="sortOrder"
                type="number"
                {...register('sortOrder')}
                placeholder="0"
                className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:outline-none"
              />
              {errors.sortOrder && (
                <p className="text-xs text-red-500 mt-0.5">{errors.sortOrder.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
            {/* Active Switch */}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-950 dark:focus:ring-zinc-300 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                Is Active (Visible on front-end)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <Link href="/admin/categories">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
