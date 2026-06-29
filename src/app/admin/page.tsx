import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    totalArticles,
    publishedArticles,
    totalUsers,
    totalComments,
    pendingComments,
    recentArticles,
  ] = await Promise.all([
    prisma.article.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.article
      .count({ where: { status: 'PUBLISHED', deletedAt: null } })
      .catch(() => 0),
    prisma.user.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.comment.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.comment
      .count({ where: { status: 'PENDING', deletedAt: null } })
      .catch(() => 0),
    prisma.article
      .findMany({
        where: { deletedAt: null },
        include: {
          category: true,
          author: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
      .catch(() => []),
  ]);

  const articles = serializeBigInt(recentArticles);

  const stats = [
    {
      title: 'Total Articles',
      value: totalArticles,
      icon: FileText,
      color: 'text-zinc-600 dark:text-zinc-400',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
    },
    {
      title: 'Published',
      value: publishedArticles,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Comments',
      value: totalComments,
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Pending Moderation',
      value: pendingComments,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  function getStatusVariant(
    status: string,
  ): 'success' | 'default' | 'secondary' {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'IN_REVIEW':
        return 'default';
      default:
        return 'secondary';
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back — here's what's happening on Khabar Cut.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {stat.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <Card>
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base font-semibold">
            Recent Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {articles.length === 0 ? (
            <p className="p-6 text-sm text-zinc-400">No articles yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      Author
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(
                    (article: {
                      id: string;
                      title: string;
                      status: string;
                      createdAt: Date | string;
                      category: { name: string } | null;
                      author: { fullName: string };
                    }) => (
                      <tr
                        key={article.id}
                        className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1 max-w-xs">
                            {article.title}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                          {article.category?.name ?? '—'}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                          {article.author.fullName}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(article.status)}>
                            {article.status === 'IN_REVIEW'
                              ? 'In Review'
                              : article.status.charAt(0) +
                                article.status.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell whitespace-nowrap">
                          {format(new Date(article.createdAt), 'dd MMM yyyy')}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
