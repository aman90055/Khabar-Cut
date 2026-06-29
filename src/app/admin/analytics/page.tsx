import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSiteSummary, getTopArticles, getDailyStats } from '@/server/db/analytics';
import { BarChart3, TrendingUp, Users, Eye, Globe, Smartphone, Laptop, Tablet } from 'lucide-react';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const fromDate = subDays(new Date(), 30);
  const toDate = new Date();

  const [summary, topArticles, dailyStats] = await Promise.all([
    getSiteSummary({ from: fromDate, to: toDate }).catch(() => ({
      totalViews: 0,
      uniqueVisitors: 0,
      deviceBreakdown: [],
      locationBreakdown: [],
    })),
    getTopArticles(5, { from: fromDate, to: toDate }).catch(() => []),
    getDailyStats({ from: fromDate, to: toDate }).catch(() => []),
  ]);

  const maxViews = Math.max(...dailyStats.map((d: any) => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Platform performance, traffic patterns and most-read stories over the last 30 days.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Pageviews</span>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{summary.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Unique Visitors</span>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{summary.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Device Type</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 capitalize">
                {summary.deviceBreakdown[0]?.deviceType || 'Mobile'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Country</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 capitalize">
                {summary.locationBreakdown[0]?.country || 'India'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Globe className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts and countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSS Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Daily Traffic Overview</CardTitle>
            <CardDescription>Visualizing pageviews day by day.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-1 pt-6">
            {dailyStats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-400 text-xs">
                <BarChart3 className="h-8 w-8 text-zinc-300 mb-2" />
                No daily stats recorded yet.
              </div>
            ) : (
              dailyStats.map((day: any) => {
                const heightPct = (day.views / maxViews) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer">
                    <div
                      className="w-full bg-red-500/20 group-hover:bg-red-500 rounded-t-sm transition-colors relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-md">
                        {day.views} views
                      </div>
                    </div>
                    <span className="text-[8px] font-semibold text-zinc-400 mt-2 truncate w-full text-center">
                      {day.date.split('-')[2]}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Countries list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Top Countries</CardTitle>
            <CardDescription>Visitors distribution by geography.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {summary.locationBreakdown.length === 0 ? (
              <p className="p-6 text-xs text-zinc-400 text-center">No location metrics available.</p>
            ) : (
              summary.locationBreakdown.map((loc: any) => (
                <div key={loc.country} className="flex items-center justify-between px-6 py-3">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 capitalize flex items-center gap-1.5">
                    🇺🇳 {loc.country}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {loc.count} pageviews
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Top Performing Articles</CardTitle>
          <CardDescription>Most read stories over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {topArticles.length === 0 ? (
            <p className="p-6 text-xs text-zinc-400 text-center">No article pageviews tracked yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="text-left py-3 px-6">Rank</th>
                    <th className="text-left py-3 px-6">Article Title</th>
                    <th className="text-right py-3 px-6">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {topArticles.map((art: any, index: number) => (
                    <tr key={art.articleId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3.5 px-6 font-bold text-zinc-400">#{index + 1}</td>
                      <td className="py-3.5 px-6 font-semibold text-zinc-900 dark:text-zinc-50">
                        {art.title}
                      </td>
                      <td className="py-3.5 px-6 text-right font-black text-zinc-700 dark:text-zinc-300">
                        {art.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
