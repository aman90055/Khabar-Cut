'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText, Users, CheckCircle2, Clock,
  Plus, Edit, Eye, TrendingUp, Newspaper,
  ArrowRight, BarChart3, Flame, AlertCircle,
} from 'lucide-react';

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalUsers: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  categories: { name: string } | null;
  author: { full_name: string } | null;
}

interface Author {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: { name: string; slug: string } | null;
}

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

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<Stats>({ totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalUsers: 0 });
  const [recentArticles, setRecentArticles] = React.useState<Article[]>([]);
  const [topAuthors, setTopAuthors] = React.useState<Author[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats ?? { totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalUsers: 0 });
        setRecentArticles(data.recentArticles ?? []);
        setTopAuthors(data.topAuthors ?? []);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      icon: FileText,
      color: 'text-zinc-600 dark:text-zinc-300',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      border: 'border-zinc-200 dark:border-zinc-700',
      href: '/admin/articles',
    },
    {
      title: 'Published',
      value: stats.publishedArticles,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      href: '/admin/articles?status=PUBLISHED',
    },
    {
      title: 'Drafts',
      value: stats.draftArticles,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      href: '/admin/articles?status=DRAFT',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
      href: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            🗞️ Khabar Cut Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Welcome back — here's your newsroom overview.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative rounded-2xl border ${card.border} bg-white dark:bg-zinc-950 p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                {loading ? '—' : card.value.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-[#D90429] transition-colors">
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Write Article', href: '/admin/articles/new', icon: Edit, color: 'bg-[#D90429] text-white' },
          { label: 'View Articles', href: '/admin/articles', icon: Newspaper, color: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' },
          { label: 'Manage Authors', href: '/admin/authors', icon: Users, color: 'bg-blue-600 text-white' },
          { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'bg-purple-600 text-white' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} rounded-xl px-4 py-3 flex items-center gap-2.5 font-semibold text-sm hover:opacity-90 transition-all shadow-sm`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#D90429]" />
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Recent Articles</h2>
            </div>
            <Link href="/admin/articles" className="text-xs text-[#D90429] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-50 dark:bg-zinc-900 rounded w-1/2" />
                </div>
              ))
            ) : recentArticles.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Newspaper className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No articles yet.</p>
                <Link href="/admin/articles/new" className="mt-2 text-xs text-[#D90429] font-bold hover:underline inline-block">
                  Create your first article →
                </Link>
              </div>
            ) : (
              recentArticles.map(article => (
                <div key={article.id} className="px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#D90429] line-clamp-1 transition-colors"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-zinc-400">
                          {article.author?.full_name || 'Unknown'}
                        </span>
                        {article.categories?.name && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span className="text-[11px] text-zinc-400">{article.categories.name}</span>
                          </>
                        )}
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <Eye className="h-3 w-3" />
                          {(article.view_count || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={article.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team / Authors */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Team Members</h2>
            </div>
            <Link href="/admin/authors" className="text-xs text-[#D90429] font-semibold hover:underline flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex items-center gap-3">
                  <div className="h-9 w-9 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3 mb-1.5" />
                    <div className="h-2.5 bg-zinc-50 dark:bg-zinc-900 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : topAuthors.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Users className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No team members yet.</p>
              </div>
            ) : (
              topAuthors.map(author => (
                <div key={author.id} className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.full_name}
                      className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D90429] to-red-700 flex items-center justify-center text-white text-xs font-black">
                      {getInitials(author.full_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {author.full_name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {author.role?.name || 'Reader'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
