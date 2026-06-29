import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

type SerializedArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
  category: { name: string } | null;
  author: { fullName: string };
};

export default async function AdminArticlesPage() {
  const rawArticles = await prisma.article
    .findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    .catch(() => []);

  const articles = serializeBigInt(rawArticles) as SerializedArticle[];

  function getStatusVariant(
    status: string,
  ): 'success' | 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'IN_REVIEW':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  function formatStatus(status: string): string {
    if (status === 'IN_REVIEW') return 'In Review';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Articles
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {articles.length} article{articles.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="w-10 py-3 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                  Author
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">
                  Published
                </th>
                <th className="text-right py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden xl:table-cell">
                  Views
                </th>
                <th className="text-right py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-zinc-400"
                  >
                    No articles yet.{' '}
                    <Link
                      href="/admin/articles/new"
                      className="text-red-600 hover:underline font-medium"
                    >
                      Create one now.
                    </Link>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500"
                          aria-label={`Select ${article.title}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="font-medium text-zinc-900 dark:text-zinc-50 hover:text-red-600 dark:hover:text-red-400 line-clamp-1 max-w-xs block transition-colors"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                        {article.category?.name ?? (
                          <span className="italic text-zinc-300 dark:text-zinc-600">
                            Uncategorised
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(article.status)}>
                          {formatStatus(article.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                        {article.author.fullName}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell whitespace-nowrap">
                        {article.publishedAt
                          ? format(new Date(article.publishedAt), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden xl:table-cell text-right font-mono text-xs">
                        {article.viewCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
