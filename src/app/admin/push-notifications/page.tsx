'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Bell, Plus, Send, Clock, CheckCircle2, XCircle, Globe, Smartphone, Monitor,
  Users, BarChart2, Target, ChevronRight, Megaphone,
} from 'lucide-react';

interface PushCampaign {
  id: string;
  title: string;
  body: string;
  iconUrl?: string;
  clickUrl?: string;
  targetAudience: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  SENDING: { label: 'Sending', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  SENT: { label: 'Sent', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  FAILED: { label: 'Failed', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function PushNotificationsPage() {
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', iconUrl: '', clickUrl: '',
    targetAudience: 'all', scheduledAt: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/push/campaigns');
    const json = await res.json();
    if (json.success) {
      setCampaigns(json.data);
      setTotal(json.total);
      setTotalSubscribers(json.totalSubscribers || 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const createCampaign = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/push/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) {
      setShowCreate(false);
      setForm({ title: '', body: '', iconUrl: '', clickUrl: '', targetAudience: 'all', scheduledAt: '' });
      fetchCampaigns();
    }
    setSaving(false);
  };

  const sentCampaigns = campaigns.filter((c) => c.status === 'SENT');
  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalDelivered = sentCampaigns.reduce((sum, c) => sum + c.totalDelivered, 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.totalClicked, 0);
  const avgCtr = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Push Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browser & Android push campaign management
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subscribers', value: totalSubscribers.toLocaleString(), icon: Users, color: 'blue' },
          { label: 'Campaigns Sent', value: sentCampaigns.length.toString(), icon: Send, color: 'green' },
          { label: 'Total Delivered', value: totalDelivered.toLocaleString(), icon: CheckCircle2, color: 'emerald' },
          { label: 'Avg. CTR', value: `${avgCtr.toFixed(2)}%`, icon: BarChart2, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg mb-3 flex items-center justify-center ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'green' ? 'bg-green-50 text-green-600' :
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Campaigns ({total})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {['Notification', 'Audience', 'Status', 'Sent', 'Delivered', 'Clicked', 'CTR', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => {
                  const statusConf = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT;
                  const ctr = campaign.totalDelivered > 0
                    ? ((campaign.totalClicked / campaign.totalDelivered) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={campaign.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{campaign.title}</p>
                        <p className="text-xs text-gray-400 truncate">{campaign.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg capitalize">
                          {campaign.targetAudience}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{campaign.totalSent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{campaign.totalDelivered.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{campaign.totalClicked.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ctr}%</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">No push campaigns yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create Push Campaign</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Breaking: Major news update..."
                  maxLength={100}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body *</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Tap to read the full story..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click URL</label>
                <input
                  type="url"
                  value={form.clickUrl}
                  onChange={(e) => setForm((f) => ({ ...f, clickUrl: e.target.value }))}
                  placeholder="https://khabarcut.com/article/..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">All Subscribers ({totalSubscribers.toLocaleString()})</option>
                  <option value="subscribers">Premium Subscribers</option>
                  <option value="states">By State</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  disabled={saving || !form.title || !form.body}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
                >
                  {form.scheduledAt ? (saving ? 'Scheduling...' : 'Schedule Campaign') : (saving ? 'Saving...' : 'Save as Draft')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
