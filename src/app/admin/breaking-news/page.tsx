import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Trash2, Power, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toggleBreakingNewsActive, deleteBreakingNews } from '@/features/breaking-news/actions';

export const dynamic = 'force-dynamic';

export default async function BreakingNewsAdminPage() {
  const alerts = await prisma.breakingNews.findMany({
    where: { deletedAt: null },
    include: {
      article: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: [{ isActive: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  }).catch(() => []);

  const serializedAlerts = serializeBigInt(alerts);
  const activeAlerts = serializedAlerts.filter((a: any) => a.isActive);
  const inactiveAlerts = serializedAlerts.filter((a: any) => !a.isActive);

  async function handleToggle(id: string) {
    'use server';
    await toggleBreakingNewsActive(id);
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteBreakingNews(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Breaking News</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage tickers and alerts displayed at the top of the homepage.</p>
        </div>
        <Link href="/admin/breaking-news/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Add Alert
          </Button>
        </Link>
      </div>

      {/* Ticker Preview */}
      {activeAlerts.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className="bg-red-600 border-none font-bold shrink-0 animate-pulse">LIVE PREVIEW</Badge>
            <div className="overflow-hidden relative flex-1 h-5 text-sm font-bold text-red-600 dark:text-red-400">
              <div className="absolute whitespace-nowrap animate-marquee flex gap-12">
                {activeAlerts.map((alert: any) => (
                  <span key={alert.id}>{alert.title}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Active Alerts ({activeAlerts.length})</h2>
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-zinc-400">No active breaking news alerts currently displaying.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert: any) => (
              <Card key={alert.id} className="border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950">
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 border-none text-[10px] font-black uppercase">
                        Priority {alert.priority}
                      </Badge>
                      {alert.expiresAt && (
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {format(new Date(alert.expiresAt), 'HH:mm dd/MM')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">{alert.title}</h3>
                    {alert.article && (
                      <p className="text-xs text-zinc-400 font-medium">
                        Linked: <span className="underline">{alert.article.title}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <form action={handleToggle.bind(null, alert.id)}>
                      <Button variant="outline" size="sm" type="submit" className="font-semibold text-xs h-8 gap-1.5">
                        <Power className="h-3.5 w-3.5 text-zinc-500" />
                        Deactivate
                      </Button>
                    </form>
                    <form action={handleDelete.bind(null, alert.id)}>
                      <Button variant="ghost" size="sm" type="submit" className="font-semibold text-xs h-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Alerts */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Inactive History ({inactiveAlerts.length})</h2>
        {inactiveAlerts.length === 0 ? (
          <p className="text-sm text-zinc-400">No inactive alert history found.</p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Expired / Created At</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {inactiveAlerts.map((alert: any) => (
                      <tr key={alert.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">{alert.title}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">P{alert.priority}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-500">
                          {format(new Date(alert.createdAt), 'dd MMM yyyy HH:mm')}
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <form action={handleToggle.bind(null, alert.id)}>
                            <Button variant="outline" size="sm" type="submit" className="font-semibold text-xs h-8 gap-1">
                              <Power className="h-3.5 w-3.5" />
                              Activate
                            </Button>
                          </form>
                          <form action={handleDelete.bind(null, alert.id)}>
                            <Button variant="ghost" size="sm" type="submit" className="h-8 text-red-500 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
