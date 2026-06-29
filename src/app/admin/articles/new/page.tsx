'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createArticle } from '@/features/articles/actions';
import { cn } from '@/utils/cn';
import { Loader2, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';

// ── Schema ────────────────────────────────────────────────────────────────────
const newArticleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().uuid('Please select a valid category'),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']),
});

type NewArticleForm = z.infer<typeof newArticleSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewArticlePage() {
  const editorRef = useRef<unknown>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewArticleForm>({
    resolver: zodResolver(newArticleSchema),
    defaultValues: {
      status: 'DRAFT',
    },
  });

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[] | { data: Category[] }) => {
        const cats = Array.isArray(data) ? data : data.data ?? [];
        setCategories(cats);
      })
      .catch(() => {
        toast.error('Failed to load categories');
      });
  }, []);

  // ── Initialize EditorJS ───────────────────────────────────────────────────
  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    let destroyed = false;

    (async () => {
      const [
        { default: EditorJS },
        { default: Header },
        { default: List },
        { default: Quote },
        { default: Code },
        { default: ImageTool },
        { default: Delimiter },
      ] = await Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/list'),
        import('@editorjs/quote'),
        import('@editorjs/code'),
        import('@editorjs/image'),
        import('@editorjs/delimiter'),
      ]);

      // @editorjs/embed has broken package.json exports — use require fallback
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
      const Embed = (require('@editorjs/embed') as any).default ?? require('@editorjs/embed');


      if (destroyed || !holderRef.current) return;

      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder: 'Write your story here...',
        tools: {
          header: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Header as any,
            config: { levels: [2, 3, 4], defaultLevel: 2 },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          list: { class: List as any, inlineToolbar: true },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quote: { class: Quote as any, inlineToolbar: true },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: { class: Code as any },
          image: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: ImageTool as any,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await res.json();
                  return { success: 1, file: { url: data.url } };
                },
              },
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delimiter: { class: Delimiter as any },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          embed: { class: Embed as any, inlineToolbar: true },
        },
        onReady: () => {
          if (!destroyed) setEditorReady(true);
        },
      });

      if (!destroyed) {
        editorRef.current = editor;
      }
    })();

    return () => {
      destroyed = true;
      if (editorRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editorRef.current as any).destroy?.();
        editorRef.current = null;
      }
    };
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (formData: NewArticleForm) => {
    if (!editorRef.current) {
      toast.error('Editor is not ready yet');
      return;
    }

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorData = await (editorRef.current as any).save();

      const result = await createArticle({
        title: formData.title,
        excerpt: formData.excerpt,
        categoryId: formData.categoryId,
        status: formData.status,
        content: editorData,
        visibility: 'PUBLIC',
        priority: 0,
        isFeatured: false,
        isBreaking: false,
      });

      if (result.success) {
        toast.success('Article saved successfully!');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save article';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            New Article
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col xl:flex-row gap-6 items-start"
      >
        {/* ── Left: Editor ── */}
        <div className="flex-[2] min-w-0 space-y-4">
          {/* Title */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <input
              {...register('title')}
              autoFocus
              placeholder="Article Title..."
              className={cn(
                'w-full text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 bg-transparent border-none outline-none focus:ring-0 resize-none leading-snug',
                errors.title && 'placeholder:text-red-300',
              )}
            />
            {errors.title && (
              <p className="mt-2 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Excerpt
            </label>
            <textarea
              {...register('excerpt')}
              rows={3}
              placeholder="Brief description of the article (optional)..."
              className="w-full text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 bg-transparent border-none outline-none focus:ring-0 resize-none leading-relaxed"
            />
            {errors.excerpt && (
              <p className="mt-1 text-xs text-red-500">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          {/* EditorJS Mount */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-[480px] overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Content
              </span>
              {!editorReady && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading editor…
                </span>
              )}
            </div>
            <div
              ref={holderRef}
              id="editorjs"
              className="prose dark:prose-invert max-w-none px-6 py-4 min-h-[400px] [&_.codex-editor]:outline-none"
            />
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-full xl:w-80 shrink-0 space-y-4">
          {/* Publish */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Publish Settings
            </h2>

            {/* Status */}
            <div className="space-y-1.5">
              <label
                htmlFor="status"
                className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
              >
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className={cn(
                  'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors',
                  errors.status && 'border-red-400',
                )}
              >
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="categoryId"
                className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
              >
                Category
              </label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className={cn(
                  'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors',
                  errors.categoryId && 'border-red-400',
                )}
              >
                <option value="">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-colors',
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save Article'}
            </button>
          </div>

          {/* Tips card */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              Writing Tips
            </h2>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>• Use Tab key to discover EditorJS block tools</li>
              <li>• Headings improve SEO and readability</li>
              <li>• Keep excerpts under 160 characters for SEO</li>
              <li>• Images require alt text for accessibility</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
