'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Send, Save, Eye,
  Hash, Image, Globe, ChevronDown, ChevronUp,
  Flame, Star, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '@/components/editor/image-uploader';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Category { id: string; name: string; slug: string; }

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoOpen, setSeoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [authorId, setAuthorId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug
  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  // Load categories and current user
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data.data ?? []))
      .catch(() => toast.error('Failed to load categories'));

    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => { if (data.data?.id) setAuthorId(data.data.id); })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!slug.trim()) errs.slug = 'Slug is required';
    if (!body.trim()) errs.body = 'Article body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          // New schema: short_description is the summary field
          short_description: excerpt.trim() || null,
          excerpt: excerpt.trim() || null,
          content: body,
          category_id: categoryId || null,
          // New schema uses lowercase status
          status: submitStatus.toLowerCase(),
          is_featured: isFeatured,
          is_breaking: isBreaking,
          author_id: authorId,
          // New schema: seo_title / seo_description
          seo_title: metaTitle.trim() || null,
          seo_description: metaDescription.trim() || null,
          featured_image_url: featuredImageUrl || null,
          featured_image_media_id: featuredImageMediaId || null,
          tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create article');
      }

      toast.success(submitStatus === 'PUBLISHED' ? '🎉 Article published successfully!' : '✅ Draft saved!');
      router.push('/admin/articles');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = body.length;
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
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish Now
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
                  onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                  className="flex-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-transparent focus:outline-none"
                  placeholder="article-url-slug"
                />
              </div>
              {errors.slug && (
                <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Excerpt / Summary
              </label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Write a brief summary of the article (shown in cards and search results)..."
                rows={2}
                maxLength={300}
                className="w-full text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 resize-none focus:outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/20 transition-all leading-relaxed"
              />
              <p className="text-[10px] text-zinc-400 text-right">{excerpt.length}/300</p>
            </div>
          </div>

          {/* Body */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Article Body</span>
              <span className="text-[10px] font-normal text-zinc-400 normal-case">
                {wordCount} words · ~{readingTime} min read
              </span>
            </label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your article here..."
              limit={20000}
            />
            {errors.body && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.body}
              </p>
            )}
            <div className="flex justify-end items-center mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Link href="#" className="text-[10px] text-[#D90429] hover:underline flex items-center gap-1">
                <Eye className="h-3 w-3" /> Preview
              </Link>
            </div>
          </div>

          {/* SEO Section */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">SEO & Meta Tags</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold">GOOGLE</span>
              </div>
              {seoOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>
            {seoOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Meta Title <span className="font-normal normal-case text-zinc-400">(shown in Google)</span>
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder={title || 'Article title for search engines...'}
                    maxLength={70}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/20 transition-all"
                  />
                  <p className={`text-[10px] text-right mt-1 ${metaTitle.length > 60 ? 'text-orange-500' : 'text-zinc-400'}`}>
                    {metaTitle.length}/70 {metaTitle.length > 60 && '(too long for Google)'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Meta Description <span className="font-normal normal-case text-zinc-400">(shown below title in Google)</span>
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Brief description for search results (150-160 characters ideal)...'}
                    rows={3}
                    maxLength={200}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/20 transition-all resize-none"
                  />
                  <p className={`text-[10px] text-right mt-1 ${metaDescription.length > 160 ? 'text-orange-500' : 'text-zinc-400'}`}>
                    {metaDescription.length}/200 {metaDescription.length > 160 && '(ideal is ≤160)'}
                  </p>
                </div>

                {/* Google Preview */}
                {(metaTitle || title) && (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Google Preview</p>
                    <p className="text-xs text-zinc-400 mb-0.5">
                      {process.env.NEXT_PUBLIC_APP_URL || 'https://khabar-cut.vercel.app'}/article/{slug || 'article-slug'}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-0.5 line-clamp-1">
                      {metaTitle || title || 'Article Title'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {metaDescription || excerpt || 'Article description will appear here in Google search results...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Article Settings</span>
              {settingsOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>
            {settingsOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#D90429] transition-all"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#D90429] transition-all"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Featured Article</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isFeatured ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isFeatured ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Breaking News</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBreaking(!isBreaking)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isBreaking ? 'bg-[#D90429]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isBreaking ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Featured Image — drag & drop uploader */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <ImageUploader
              value={featuredImageUrl}
              onChange={(url, mediaId) => {
                setFeaturedImageUrl(url);
                setFeaturedImageMediaId(mediaId ?? null);
              }}
              label="Featured Image"
              hint="JPG, PNG, WebP — Max 10MB. Click or drag & drop."
            />
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Tags</span>
            </div>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="politics, india, election, 2024"
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-[#D90429] transition-all"
            />
            <p className="text-[10px] text-zinc-400">Separate tags with commas</p>
          </div>

          {/* Auth Error */}
          {errors.author && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{errors.author}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-sm font-bold px-5 py-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish Article
            </button>
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold px-5 py-2.5 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
