'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Eye, MousePointer,
  BarChart2, Activity, Zap, Target, Award, RefreshCw, Download,
  ArrowUpRight, ArrowDownRight, Globe, Smartphone, Monitor,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface RevenueOverview {
  todayRevenue: number;
  todayImpressions: number;
  todayClicks: number;
  todayCtr: number;
  todayRpm: number;
  monthRevenue: number;
  monthImpressions: number;
  yearRevenue: number;
  prevMonthRevenue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  mrr: number;
  arr: number;
  fillRate: number;
  avgEcpm: number;
  revenueBySource: Array<{ source: string; label: string; revenue: number; percentage: number; change: number }>;
  topAdSlots: Array<{ position: string; name: string; impressions: number; clicks: number; ctr: number; rpm: number; revenue: number; fillRate: number }>;

  topAdvertisers: Array<{ id: string; companyName: string; logoUrl?: string; totalSpend: number; activeCampaigns: number; impressions: number; clicks: number }>;
  forecast7d: number;
  forecast30d: number;
}

interface ChartPoint {
  date: string;
  revenue: number;
  adRevenue: number;
  subscriptionRevenue: number;
  impressions: number;
  clicks: number;
}

const REVENUE_COLORS = ['#e11d48', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const formatPercent = (n: number) => `${n.toFixed(2)}%`;

function KpiCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color = 'red', loading = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  loading?: boolean;
}) {
  const colorMap = {
    red: 'from-rose-500 to-red-600',
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
    purple: 'from-violet-500 to-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
            trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-50 text-gray-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{title}</p>
        </>
      )}
    </div>
  );
}

const PERIODS = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
];

export default function RevenueDashboardPage() {
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/revenue/overview');
      const json = await res.json();
      if (json.success) {
        setOverview(json.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch revenue overview:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async (p: string) => {
    try {
      setChartLoading(true);
      const res = await fetch(`/api/admin/revenue/chart?period=${p}`);
      const json = await res.json();
      if (json.success) setChartData(json.data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchChart(period);
  }, [period, fetchChart]);

  const monthChange = overview
    ? overview.prevMonthRevenue > 0
      ? ((overview.monthRevenue - overview.prevMonthRevenue) / overview.prevMonthRevenue) * 100
      : 0
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enterprise revenue analytics & monetization intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchOverview}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Revenue"
          value={formatCurrency(overview?.todayRevenue || 0)}
          subtitle={`${formatNumber(overview?.todayImpressions || 0)} impressions`}
          icon={DollarSign}
          color="red"
          loading={loading}
        />
        <KpiCard
          title="Monthly Revenue"
          value={formatCurrency(overview?.monthRevenue || 0)}
          subtitle="Current month"
          icon={BarChart2}
          trend={monthChange >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(monthChange).toFixed(1)}%`}
          color="blue"
          loading={loading}
        />
        <KpiCard
          title="MRR"
          value={formatCurrency(overview?.mrr || 0)}
          subtitle={`ARR ${formatCurrency(overview?.arr || 0)}`}
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
        <KpiCard
          title="Active Subscribers"
          value={formatNumber(overview?.activeSubscribers || 0)}
          subtitle={`${formatNumber(overview?.totalSubscribers || 0)} total`}
          icon={Users}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Today CTR', value: formatPercent(overview?.todayCtr || 0), icon: MousePointer },
          { label: 'RPM', value: `₹${(overview?.todayRpm || 0).toFixed(2)}`, icon: Zap },
          { label: 'Impressions', value: formatNumber(overview?.monthImpressions || 0), icon: Eye },
          { label: 'Annual Revenue', value: formatCurrency(overview?.yearRevenue || 0), icon: Award },
          { label: '7d Forecast', value: formatCurrency(overview?.forecast7d || 0), icon: Target },
          { label: '30d Forecast', value: formatCurrency(overview?.forecast30d || 0), icon: Activity },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
            </div>
            {loading ? (
              <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-base font-bold text-gray-900 dark:text-white">{item.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ad revenue vs subscription revenue over time</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === p.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No revenue data for selected period</p>
              <p className="text-xs mt-1">Revenue snapshots will appear here once ads are running</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="adRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="subRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${formatNumber(v)}`} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value || 0)),
                  name === 'adRevenue' ? 'Ad Revenue' : name === 'subscriptionRevenue' ? 'Subscription Revenue' : 'Total',
                ]}

                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}
              />
              <Legend />
              <Area type="monotone" dataKey="adRevenue" stroke="#e11d48" fill="url(#adRevGradient)" strokeWidth={2} name="adRevenue" />
              <Area type="monotone" dataKey="subscriptionRevenue" stroke="#3b82f6" fill="url(#subRevGradient)" strokeWidth={2} name="subscriptionRevenue" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue by Source + Top Advertisers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Revenue by Source</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Current month breakdown</p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : overview?.revenueBySource && overview.revenueBySource.length > 0 ? (
            <div className="space-y-3">
              {overview.revenueBySource.map((source, idx) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(source.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${source.percentage}%`, backgroundColor: REVENUE_COLORS[idx % REVENUE_COLORS.length] }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{source.percentage.toFixed(1)}% of total</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PieChart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No revenue data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Advertisers */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Top Advertisers</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">By total campaign spend</p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : overview?.topAdvertisers && overview.topAdvertisers.length > 0 ? (
            <div className="space-y-3">
              {overview.topAdvertisers.map((adv, idx) => (
                <div key={adv.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{adv.companyName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{adv.companyName}</p>
                    <p className="text-xs text-gray-500">{adv.activeCampaigns} active campaigns</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(adv.totalSpend)}</p>
                    <p className="text-xs text-gray-400">{formatNumber(adv.impressions)} imp</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No advertisers yet</p>
                <p className="text-xs mt-1">Add your first advertiser to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad Slot Performance */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ad Slot Performance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active ad positions with metrics</p>
          </div>
          <a href="/admin/advertisements" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
            Manage Slots →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Position', 'Impressions', 'Clicks', 'CTR', 'RPM', 'Fill Rate'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 pr-4 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : overview?.topAdSlots && overview.topAdSlots.length > 0 ? (
                overview.topAdSlots.map((slot) => (
                  <tr key={slot.position} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{slot.name}</span>
                      <p className="text-xs text-gray-400">{slot.position}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{formatNumber(slot.impressions)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{formatNumber(slot.clicks)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{formatPercent(slot.ctr)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">₹{slot.rpm.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <div className="h-1.5 bg-rose-500 rounded-full" style={{ width: `${slot.fillRate || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{(slot.fillRate || 0).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No ad slots configured</p>
                    <a href="/admin/advertisements" className="text-xs text-rose-600 hover:underline mt-1 block">
                      Set up ad slots →
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">7-Day Forecast</h3>
              <p className="text-xs text-rose-200">Based on current daily average</p>
            </div>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(overview?.forecast7d || 0)}</p>
          <p className="text-sm text-rose-200 mt-2">Projected next 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">30-Day Forecast</h3>
              <p className="text-xs text-blue-200">Linear extrapolation</p>
            </div>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(overview?.forecast30d || 0)}</p>
          <p className="text-sm text-blue-200 mt-2">Projected next 30 days</p>
        </div>
      </div>
    </div>
  );
}
