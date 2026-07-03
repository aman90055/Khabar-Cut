'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Plus, Search, LayoutGrid, List, Eye,
  Edit, Clock, CheckCircle2, FileText, Loader2,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  categories: { name: string; slug: string } | null;
  author: { full_name: string } | null;
}

const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'In Review', value: 'IN_REVIEW' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: 'Published', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    DRAFT: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
    IN_REVIEW: { label: 'In Review', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    APPROVED: { label: 'Approved', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };
  const s = map[status] || { label: status, cls: 'bg-zinc-100 text-zinc-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchArticles = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    params.set('pageSize', '30');

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.data ?? []);
        setTotal(data.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, debouncedSearch]);

  React.useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handlePublish = async (id: string) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    });
    fetchArticles();
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Articles</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {total} article{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 transition-all shadow-md hover:shadow-lg self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D90429]/30 focus:border-[#D90429] transition-all"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setView('card')}
            className={`p-1.5 rounded-lg transition-all ${view === 'card' ? 'bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded-lg transition-all ${view === 'table' ? 'bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#D90429]" />
        </div>
      )}

      {/* Empty */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-3">No articles found</p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-[#D90429] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-red-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create First Article
          </Link>
        </div>
      )}

      {/* Card View */}
      {!loading && articles.length > 0 && view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map(article => (
            <div
              key={article.id}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={article.status} />
                <span className="text-[11px] text-zinc-400">
                  {formatDate(article.created_at)}
                </span>
              </div>

              <div>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="font-bold text-zinc-900 dark:text-zinc-50 hover:text-[#D90429] transition-colors line-clamp-2 text-base leading-snug"
                >
                  {article.title}
                </Link>
                {article.excerpt && (
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                {article.categories?.name && (
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-medium text-zinc-600 dark:text-zinc-400">
                    {article.categories.name}
                  </span>
                )}
                {article.author?.full_name && (
                  <span>by {article.author.full_name}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Eye className="h-3 w-3" />
                  {(article.view_count || 0).toLocaleString()} views
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Link>
                  {article.status !== 'PUBLISHED' && (
                    <button
                      onClick={() => handlePublish(article.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && articles.length > 0 && view === 'table' && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden md:table-cell">Author</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden xl:table-cell">Views</th>
                  <th className="text-right py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/admin/articles/${article.id}/edit`} className="font-medium text-zinc-900 dark:text-zinc-50 hover:text-[#D90429] line-clamp-1 max-w-xs block transition-colors">
                        {article.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 hidden sm:table-cell">{article.categories?.name || '—'}</td>
                    <td className="py-3 px-4"><StatusBadge status={article.status} /></td>
                    <td className="py-3 px-4 text-zinc-500 hidden md:table-cell">{article.author?.full_name || '—'}</td>
                    <td className="py-3 px-4 text-zinc-500 hidden lg:table-cell whitespace-nowrap">{formatDate(article.created_at)}</td>
                    <td className="py-3 px-4 text-zinc-500 hidden xl:table-cell text-right font-mono text-xs">{(article.view_count || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/articles/${article.id}/edit`} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Edit className="h-3 w-3" /> Edit
                        </Link>
                        {article.status !== 'PUBLISHED' && (
                          <button onClick={() => handlePublish(article.id)} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors">
                            <Clock className="h-3 w-3" /> Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent" /></div>}>
      <ArticlesContent />
    </Suspense>
  );
}
