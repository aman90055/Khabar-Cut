'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Building2, Plus, Search, Filter, ExternalLink, CheckCircle2, XCircle,
  Clock, Ban, Mail, Phone, Globe, Megaphone, TrendingUp, Eye,
} from 'lucide-react';

interface Advertiser {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  gstNumber?: string;
  city?: string;
  state?: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  logoUrl?: string;
  campaignCount: number;
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  VERIFIED: { label: 'Verified', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  SUSPENDED: { label: 'Suspended', icon: Ban, color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(n);

export default function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Advertiser | null>(null);

  const fetchAdvertisers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    const res = await fetch(`/api/admin/advertisers?${params}`);
    const json = await res.json();
    if (json.success) {
      setAdvertisers(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchAdvertisers(); }, [fetchAdvertisers]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/advertisers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAdvertisers();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: status as Advertiser['status'] } : null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertiser Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} total advertisers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700">
          <Plus className="w-4 h-4" />
          Add Advertiser
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = advertisers.filter((a) => a.status === status).length;
          return (
            <div key={status} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <config.icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{config.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, email, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {['Company', 'Contact', 'Location', 'Status', 'Campaigns', 'Total Spend', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : advertisers.length > 0 ? (
                advertisers.map((adv) => {
                  const statusConf = STATUS_CONFIG[adv.status];
                  return (
                    <tr key={adv.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{adv.companyName[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{adv.companyName}</p>
                            {adv.website && (
                              <a href={adv.website} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-600 hover:underline flex items-center gap-0.5">
                                <Globe className="w-3 h-3" />{new URL(adv.website).hostname}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{adv.contactName}</p>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{adv.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {[adv.city, adv.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{adv.campaignCount}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(adv.totalSpend)}</p>
                        <p className="text-xs text-gray-400">{formatNumber(adv.totalImpressions)} imp</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {adv.status === 'PENDING' && (
                            <button
                              onClick={() => updateStatus(adv.id, 'VERIFIED')}
                              className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          {adv.status === 'VERIFIED' && (
                            <button
                              onClick={() => updateStatus(adv.id, 'SUSPENDED')}
                              className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => setSelected(adv)}
                            className="px-2 py-1 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Building2 className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">No advertisers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selected.companyName}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Contact</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.contactName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">GST Number</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{selected.gstNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Spend</p>
                  <p className="text-sm font-bold text-rose-600">{formatCurrency(selected.totalSpend)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Campaigns</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.campaignCount}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {selected.status === 'PENDING' && (
                  <button onClick={() => updateStatus(selected.id, 'VERIFIED')}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
                    ✓ Verify Advertiser
                  </button>
                )}
                <button onClick={() => updateStatus(selected.id, 'REJECTED')}
                  className="flex-1 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
