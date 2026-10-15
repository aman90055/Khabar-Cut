import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Power, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BreakingNewsAdminPage() {
  const { data: alerts } = await supabase
    .from('breaking_news')
    .select('id, article_id, headline, priority, is_active, start_at, end_at, created_at, article:articles!article_id(id, title, slug)')
    .order('is_active', { ascending: false })
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  const activeAlerts = alerts?.filter((a: any) => a.is_active) || [];
  const inactiveAlerts = alerts?.filter((a: any) => !a.is_active) || [];

  async function handleToggle(id: string, currentStatus: boolean) {
    'use server';
    await supabase
      .from('breaking_news')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    revalidatePath('/admin/breaking-news');
  }

  async function handleDelete(id: string) {
    'use server';
    await supabase
      .from('breaking_news')
      .delete()
      .eq('id', id);
    revalidatePath('/admin/breaking-news');
  }

  return (
    <div className="space-y-6">
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

      {activeAlerts.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge className="bg-red-600 border-none font-bold shrink-0 animate-pulse">LIVE PREVIEW</Badge>
            <div className="overflow-hidden relative flex-1 h-5 text-sm font-bold text-red-600 dark:text-red-400">
              <div className="absolute whitespace-nowrap animate-marquee flex gap-12">
                {activeAlerts.map((alert: any) => (
                  <span key={alert.id}>{alert.headline}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                      {alert.end_at && (
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {format(new Date(alert.end_at), 'HH:mm dd/MM')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">{alert.headline}</h3>
                    {alert.article && (
                      <p className="text-xs text-zinc-400 font-medium">
                        Linked: <span className="underline">{alert.article.title}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <form action={handleToggle.bind(null, alert.id, alert.is_active)}>
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
                      <th className="text-left py-3 px-4">Headline</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Created At</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {inactiveAlerts.map((alert: any) => (
                      <tr key={alert.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">{alert.headline}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">P{alert.priority}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-500">
                          {alert.created_at ? format(new Date(alert.created_at), 'dd MMM yyyy HH:mm') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <form action={handleToggle.bind(null, alert.id, alert.is_active)}>
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
