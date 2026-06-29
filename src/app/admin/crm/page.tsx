'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Phone, PhoneCall, Mail, MessageSquare, Calendar, User, Building2, Tag,
  MapPin, DollarSign, Plus, Search, ChevronRight, Clock, CheckCircle2,
  XCircle, AlertCircle, TrendingUp, Users, Briefcase,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  designation?: string;
  source: string;
  status: string;
  pipelineStage: number;
  value?: number;
  currency: string;
  assignedTo?: string;
  city?: string;
  state?: string;
  notes?: string;
  lastContactedAt?: string;
  expectedCloseAt?: string;
  createdAt: string;
}

interface PipelineStat {
  status: string;
  count: number;
  totalValue: number;
}

const STAGES = [
  { status: 'NEW', label: 'New', color: '#6366f1' },
  { status: 'CONTACTED', label: 'Contacted', color: '#f59e0b' },
  { status: 'QUALIFIED', label: 'Qualified', color: '#3b82f6' },
  { status: 'PROPOSAL_SENT', label: 'Proposal', color: '#8b5cf6' },
  { status: 'NEGOTIATION', label: 'Negotiation', color: '#ec4899' },
  { status: 'WON', label: 'Won', color: '#10b981' },
  { status: 'LOST', label: 'Lost', color: '#ef4444' },
];

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: 'Website', REFERRAL: 'Referral', COLD_CALL: 'Cold Call',
  EMAIL: 'Email', SOCIAL_MEDIA: 'Social Media', ADVERTISEMENT: 'Ad',
  EVENT: 'Event', PARTNER: 'Partner', OTHER: 'Other',
};

const NOTE_TYPE_ICONS: Record<string, React.ElementType> = {
  GENERAL: MessageSquare, CALL: PhoneCall, EMAIL: Mail,
  WHATSAPP: MessageSquare, MEETING: Users,
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(n);

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipelineStats, setPipelineStats] = useState<PipelineStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('GENERAL');
  const [addingNote, setAddingNote] = useState(false);
  const [view, setView] = useState<'table' | 'kanban'>('table');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/admin/crm/leads?${params}`);
    const json = await res.json();
    if (json.success) {
      setLeads(json.data);
      setTotal(json.total);
      setPipelineStats(json.pipelineStats || []);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLeadStatus = async (id: string, status: string) => {
    const stage = STAGES.findIndex((s) => s.status === status);
    await fetch(`/api/admin/crm/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, pipelineStage: stage }),
    });
    fetchLeads();
  };

  const addNote = async () => {
    if (!selected || !noteContent.trim()) return;
    setAddingNote(true);
    await fetch(`/api/admin/crm/leads/${selected.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: 'admin', type: noteType, content: noteContent }),
    });
    setNoteContent('');
    setAddingNote(false);
  };

  const totalPipelineValue = pipelineStats.reduce((sum, s) => sum + s.totalValue, 0);
  const totalLeads = pipelineStats.reduce((sum, s) => sum + s.count, 0);
  const wonLeads = pipelineStats.find((s) => s.status === 'WON')?.count || 0;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management CRM</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sales pipeline & lead tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: totalLeads.toString(), icon: Users, color: 'blue' },
          { label: 'Pipeline Value', value: formatCurrency(totalPipelineValue), icon: DollarSign, color: 'rose' },
          { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'green' },
          { label: 'Won Deals', value: wonLeads.toString(), icon: CheckCircle2, color: 'emerald' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg mb-3 flex items-center justify-center ${
              kpi.color === 'rose' ? 'bg-rose-50 text-rose-600' :
              kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              kpi.color === 'green' ? 'bg-green-50 text-green-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Sales Pipeline</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const stat = pipelineStats.find((s) => s.status === stage.status);
            return (
              <button
                key={stage.status}
                onClick={() => setStatusFilter(stage.status === statusFilter ? '' : stage.status)}
                className={`flex-none p-4 rounded-xl border-2 transition-all min-w-[120px] text-left ${
                  statusFilter === stage.status ? 'border-current' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                }`}
                style={{ borderColor: statusFilter === stage.status ? stage.color : undefined }}
              >
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: stage.color }} />
                <p className="text-xs font-medium text-gray-500 mb-1">{stage.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat?.count || 0}</p>
                {(stat?.totalValue || 0) > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(stat!.totalValue)}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {['Lead', 'Company', 'Source', 'Status', 'Value', 'Last Contact', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => {
                  const stage = STAGES.find((s) => s.status === lead.status);
                  return (
                    <tr key={lead.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.email || lead.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{lead.company || '—'}</p>
                        <p className="text-xs text-gray-400">{lead.designation || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-1 rounded-lg font-medium text-white"
                          style={{ backgroundColor: stage?.color || '#6b7280' }}
                        >
                          {stage?.label || lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {lead.value ? formatCurrency(lead.value) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {lead.lastContactedAt
                          ? new Date(lead.lastContactedAt).toLocaleDateString('en-IN')
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(lead)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Briefcase className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">No leads found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selected.name}</h3>
                  {selected.company && <p className="text-sm text-gray-500">{selected.designation} @ {selected.company}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {/* Status update */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {STAGES.filter((s) => s.status !== selected.status).map((stage) => (
                  <button
                    key={stage.status}
                    onClick={() => updateLeadStatus(selected.id, stage.status)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: stage.color }}
                  >
                    → {stage.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Deal Value</p>
                  <p className="text-sm font-semibold text-rose-600">{selected.value ? formatCurrency(selected.value) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Source</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{SOURCE_LABELS[selected.source]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{[selected.city, selected.state].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Expected Close</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selected.expectedCloseAt ? new Date(selected.expectedCloseAt).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
              </div>

              {/* Add Note */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add Activity Log</h4>
                <div className="flex gap-2 mb-2">
                  {(['GENERAL', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNoteType(type)}
                      className={`px-2 py-1 text-xs rounded-lg transition-all ${
                        noteType === type ? 'bg-rose-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note about this contact..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !noteContent.trim()}
                  className="mt-2 w-full py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  {addingNote ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
