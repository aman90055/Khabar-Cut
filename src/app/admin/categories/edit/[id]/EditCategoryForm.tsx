'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { updateCategory } from '@/features/categories/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

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

interface EditCategoryFormProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    icon: string | null;
    color: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
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
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId,
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    },
  });

  const colorValue = watch('color') || '#3b82f6';

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data.data ?? [];
        // Exclude the category itself from parent selection to avoid circular reference
        setCategories(cats.filter((c: CategoryOption) => c.id !== category.id));
      })
      .catch(() => {
        toast.error('Failed to load active categories');
      })
      .finally(() => {
        setIsLoadingCats(false);
      });
  }, [category.id]);

  const onSubmit = (data: FormInput) => {
    const payload = {
      name: data.name,
      slug: data.slug ? data.slug.trim() : undefined,
      description: data.description ? data.description.trim() : null,
      parentId: !data.parentId || data.parentId === 'null' ? null : data.parentId,
      icon: data.icon ? data.icon.trim() : null,
      color: data.color ? data.color : null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };

    startTransition(async () => {
      try {
        const res = await updateCategory(category.id, { ...payload, id: category.id });
        if (res.success) {
          toast.success('Category updated successfully!');
          router.push('/admin/categories');
        } else {
          toast.error('Failed to update category');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to update category');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Edit Category</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Modify the category details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="e.g. Technology"
              className={cn(
                "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors",
                errors.name && "border-red-500 focus:ring-red-500"
              )}
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
              placeholder="Leave empty to auto-generate from name"
              className={cn(
                "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors",
                errors.slug && "border-red-500 focus:ring-red-500"
              )}
            />
            {errors.slug && (
              <p className="text-xs text-red-500 mt-0.5">{errors.slug.message}</p>
            )}
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
              placeholder="Describe what this category represents..."
              className={cn(
                "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors resize-none",
                errors.description && "border-red-500 focus:ring-red-500"
              )}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-0.5">{errors.description.message}</p>
            )}
          </div>

          {/* Parent Category ID */}
          <div className="space-y-1">
            <label htmlFor="parentId" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Parent Category
            </label>
            <select
              id="parentId"
              {...register('parentId')}
              disabled={isLoadingCats}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
            >
              <option value="">None (Top Level Category)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Icon */}
            <div className="space-y-1">
              <label htmlFor="icon" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Icon (Name)
              </label>
              <input
                id="icon"
                type="text"
                {...register('icon')}
                placeholder="e.g. Cpu, Globe, Film"
                className={cn(
                  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors",
                  errors.icon && "border-red-500 focus:ring-red-500"
                )}
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
                  placeholder="e.g. #3b82f6"
                  className={cn(
                    "flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors",
                    errors.color && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              {errors.color && (
                <p className="text-xs text-red-500 mt-0.5">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
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
                className={cn(
                  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors",
                  errors.sortOrder && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.sortOrder && (
                <p className="text-xs text-red-500 mt-0.5">{errors.sortOrder.message}</p>
              )}
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:pt-4">
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
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
