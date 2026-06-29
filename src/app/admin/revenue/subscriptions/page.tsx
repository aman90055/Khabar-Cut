'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, TrendingUp, DollarSign, RefreshCw, Plus, Check, X, ChevronDown } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  trialDays: number;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  adFree: boolean;
  exclusiveContent: boolean;
  premiumVideos: boolean;
  premiumNewsletter: boolean;
  subscriberCount: number;
  mrr: number;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  ANNUAL: 'Annual',
  LIFETIME: 'Lifetime',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  TRIAL: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAST_DUE: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscribers'>('plans');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const fetchPlans = useCallback(async () => {
    const res = await fetch('/api/admin/subscriptions/plans');
    const json = await res.json();
    if (json.success) setPlans(json.data);
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/subscriptions/subscribers?${params}`);
    const json = await res.json();
    if (json.success) {
      setSubscribers(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (activeTab === 'subscribers') fetchSubscribers();
    else setLoading(false);
  }, [activeTab, fetchSubscribers]);

  const totalMrr = plans.reduce((sum, p) => sum + p.mrr, 0);
  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscriberCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage plans, pricing and subscriber base</p>
        </div>
        <button
          onClick={() => setShowCreatePlan(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Recurring Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMrr)}</p>
          <p className="text-xs text-gray-400 mt-1">ARR: {formatCurrency(totalMrr * 12)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Active Subscribers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Active Plans</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.filter((p) => p.isActive).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['plans', 'subscribers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
              plan.isFeatured ? 'border-rose-300 dark:border-rose-600 ring-2 ring-rose-500/20' : 'border-gray-100 dark:border-gray-800'
            }`}>
              {plan.isFeatured && (
                <div className="bg-gradient-to-r from-rose-600 to-rose-700 py-1.5 px-4 text-center">
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">⭐ Most Popular</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${plan.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">/ {CYCLE_LABELS[plan.billingCycle]}</span>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    { label: 'Ad Free', enabled: plan.adFree },
                    { label: 'Exclusive Content', enabled: plan.exclusiveContent },
                    { label: 'Premium Videos', enabled: plan.premiumVideos },
                    { label: 'Premium Newsletter', enabled: plan.premiumNewsletter },
                  ].map((feat) => (
                    <div key={feat.label} className="flex items-center gap-2">
                      {feat.enabled ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={`text-sm ${feat.enabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>{feat.label}</span>
                    </div>
                  ))}
                </div>

                {plan.features.slice(0, 3).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <Check className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{feat}</span>
                  </div>
                ))}

                <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Subscribers</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.subscriberCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">MRR</p>
                    <p className="font-semibold text-rose-600">{formatCurrency(plan.mrr)}</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No subscription plans yet</p>
              <button
                onClick={() => setShowCreatePlan(true)}
                className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700"
              >
                Create First Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subscribers Table */}
      {activeTab === 'subscribers' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
              <option value="PAST_DUE">Past Due</option>
            </select>
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['User', 'Plan', 'Status', 'Start Date', 'End Date', 'Auto Renew'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : subscribers.length > 0 ? (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{sub.userId.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{sub.plan.name}</span>
                        <p className="text-xs text-gray-400">{CYCLE_LABELS[sub.plan.billingCycle]} • {formatCurrency(sub.plan.price)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[sub.status] || ''}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sub.startDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sub.endDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${sub.autoRenew ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {sub.autoRenew ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No subscribers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
