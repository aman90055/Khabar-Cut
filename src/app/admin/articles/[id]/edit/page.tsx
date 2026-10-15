'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Send, Save,
  Hash, Image as ImageIcon, Globe, ChevronDown, ChevronUp,
  Flame, Star, AlertCircle, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '@/components/editor/image-uploader';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Category { id: string; name: string; slug: string; }

interface EditArticleProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticleProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoOpen, setSeoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'review'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data.data ?? []))
      .catch(() => toast.error('Failed to load categories'));

    // Load article details
    fetch(`/api/articles/${id}`)
      .then(r => r.json())
      .then(data => {
        const article = data.data || data;
        if (article) {
          setTitle(article.title || '');
          setSlug(article.slug || '');
          setExcerpt(article.short_description || article.excerpt || '');
          setBody(article.content || '');
          setCategoryId(article.category_id || article.categoryId || '');
          setStatus((article.status || 'draft').toLowerCase());
          setIsFeatured(!!article.is_featured || !!article.isFeatured);
          setIsBreaking(!!article.is_breaking || !!article.isBreaking);
          setMetaTitle(article.seo_title || article.metaTitle || '');
          setMetaDescription(article.seo_description || article.metaDescription || '');
          setFeaturedImageUrl(article.featured_image?.public_url || article.featured_image_url || article.featuredImage?.url || '');
          setFeaturedImageMediaId(article.featured_image_id || null);
          if (article.tags && Array.isArray(article.tags)) {
            setTags(article.tags.map((t: any) => typeof t === 'string' ? t : t.name || t.tag?.name).filter(Boolean).join(', '));
          }
        }
      })
      .catch((err) => {
        toast.error('Failed to load article');
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!slug.trim()) errs.slug = 'Slug is required';
    if (!body.trim()) errs.body = 'Article body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          short_description: excerpt.trim() || null,
          excerpt: excerpt.trim() || null,
          content: body,
          category_id: categoryId || null,
          status: submitStatus,
          is_featured: isFeatured,
          is_breaking: isBreaking,
          seo_title: metaTitle.trim() || null,
          seo_description: metaDescription.trim() || null,
          featured_image_url: featuredImageUrl || null,
          featured_image_media_id: featuredImageMediaId || null,
          tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update article');
      }

      toast.success(submitStatus === 'published' ? '🎉 Article updated and published!' : '✅ Article updated!');
      router.push('/admin/articles');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');
      toast.success('Article deleted successfully');
      router.push('/admin/articles');
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D90429]" />
      </div>
    );
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/articles"
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold px-3 py-2.5 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
            <div>
              <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Article Title..."
                rows={2}
                className="w-full text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-700 bg-transparent resize-none focus:outline-none leading-tight"
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <Hash className="h-3 w-3" /> URL Slug
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 focus-within:border-[#D90429] focus-within:ring-1 focus-within:ring-[#D90429]/20 transition-all">
                <span className="text-xs text-zinc-400 shrink-0 hidden sm:block">/article/</span>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="flex-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-transparent focus:outline-none"
                  placeholder="article-url-slug"
                />
              </div>
              {errors.slug && (
                <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Short Summary / Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief overview of the article for cards & SEO..."
              rows={3}
              className="w-full text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-[#D90429] transition-colors"
            />
          </div>

          {/* Rich Text Editor Body */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Article Body
              </label>
              <div className="text-xs text-zinc-400 flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your article content here..."
            />
            {errors.body && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.body}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-5">
          {/* Featured Image */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5 text-[#D90429]" /> Featured Image
            </label>
            <ImageUploader
              value={featuredImageUrl}
              onChange={(url, mediaId) => {
                setFeaturedImageUrl(url);
                setFeaturedImageMediaId(mediaId || null);
              }}
            />
          </div>

          {/* Publish Settings */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center justify-between w-full text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
            >
              <span>Publish Settings</span>
              {settingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {settingsOpen && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Flags */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={e => setIsFeatured(e.target.checked)}
                      className="rounded text-[#D90429] focus:ring-[#D90429]"
                    />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Featured Article
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={e => setIsBreaking(e.target.checked)}
                      className="rounded text-[#D90429] focus:ring-[#D90429]"
                    />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500" /> Breaking News Ticker
                    </span>
                  </label>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="e.g. politics, india, news"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex items-center justify-between w-full text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-blue-500" /> SEO Optimization
              </span>
              {seoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {seoOpen && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Meta Title
                  </label>
                  <input
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="SEO Title (defaults to article title)"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Search engine snippet (max 160 chars)"
                    rows={2}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
