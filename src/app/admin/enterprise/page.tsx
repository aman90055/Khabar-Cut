'use client';

import * as React from 'react';
import {
  Building2, Users, CreditCard, Scale, ShieldAlert,
  Server, Shield, RefreshCw, CheckCircle2, AlertCircle,
  FileText, Landmark, UserCheck, Activity, Award, UserX,
  FileSignature, HelpCircle, HardDrive, DollarSign, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TabType = 'overview' | 'hrms' | 'finance' | 'legal' | 'governance';

export default function EnterprisePortal() {
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const [backupRunning, setBackupRunning] = React.useState(false);

  const handleBackup = () => {
    setBackupRunning(true);
    setTimeout(() => {
      setBackupRunning(false);
      toast.success('Enterprise backup archived to AWS S3 & Cloudflare R2 successfully!');
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#071330] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0057FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#F6B100] text-xs font-black uppercase tracking-widest">
              <Building2 className="w-4 h-4" /> Enterprise media ecosystem
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Khabar Cut Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Unified operational control for Multi-Tenant Deployments, HRMS payroll, Finance budgets, Legal archives, and Editorial governance.
            </p>
          </div>
          <Button
            onClick={handleBackup}
            disabled={backupRunning}
            className="bg-[#D90429] hover:bg-[#A80320] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-red-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${backupRunning ? 'animate-spin' : ''}`} />
            {backupRunning ? 'Backing Up...' : 'Trigger Backup'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigator */}
      <div className="flex gap-2 border-b border-gray-250 dark:border-white/5 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'Overview & Cloud', icon: Server },
          { id: 'hrms', label: 'HRMS Portal', icon: Users },
          { id: 'finance', label: 'Finance & Ledger', icon: CreditCard },
          { id: 'legal', label: 'Legal & Contracts', icon: Scale },
          { id: 'governance', label: 'Governance & Audits', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0057FF] text-white'
                  : 'bg-white dark:bg-[#0D1526] text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-150 dark:border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* 1. OVERVIEW & CLOUD */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Server className="w-4 h-4 text-[#0057FF]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Server Cluster Health</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { node: 'US-East EKS Primary', status: 'Online', load: '32%', color: 'emerald' },
                    { node: 'EU-West EKS Secondary', status: 'Online', load: '14%', color: 'emerald' },
                    { node: 'AP-South EKS Edge', status: 'Online', load: '45%', color: 'emerald' },
                  ].map((node) => (
                    <div key={node.node} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-600 dark:text-gray-400">{node.node}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-semibold">Load: {node.load}</span>
                        <Badge className="bg-emerald-600 text-white text-[8px] font-black">{node.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Shield className="w-4 h-4 text-[#D90429]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">WAF & Security Shield</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-600 dark:text-gray-400">Cloudflare Tunnel Status</span>
                    <Badge className="bg-emerald-600 text-white text-[8px] font-black">Protected</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-600 dark:text-gray-400">DDoS Mitigated (Last 24h)</span>
                    <span className="font-extrabold text-[#D90429]">1,420 attacks</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-600 dark:text-gray-400">SSL Certificate Expiry</span>
                    <span className="font-semibold text-gray-500">248 days remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <HardDrive className="w-4 h-4 text-[#F6B100]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Disaster Recovery (DR)</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last System Sync</span>
                    <span className="font-bold">4 mins ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PostgreSQL Replication lag</span>
                    <span className="font-bold text-emerald-600">0.02 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Failover Standby Cluster</span>
                    <span className="font-bold text-emerald-600">US-West Hot Standby</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. HRMS PORTAL */}
        {activeTab === 'hrms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <UserCheck className="w-4 h-4 text-[#0057FF]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Employee Directory Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/5 text-gray-400 font-bold">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Department</th>
                        <th className="pb-2">Salary Band</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-semibold">
                      {[
                        { name: 'Amit Verma', dept: 'Editorial', band: 'Band C', status: 'Present' },
                        { name: 'Pooja Nair', dept: 'Technology', band: 'Band A', status: 'Remote' },
                        { name: 'Sameer Sen', dept: 'HR & Ops', band: 'Band B', status: 'On Leave' },
                      ].map((emp) => (
                        <tr key={emp.name} className="hover:bg-gray-50 dark:hover:bg-white/2">
                          <td className="py-2.5">{emp.name}</td>
                          <td className="py-2.5 text-gray-500">{emp.dept}</td>
                          <td className="py-2.5 text-gray-500">{emp.band}</td>
                          <td className="py-2.5">
                            <Badge className={`${
                              emp.status === 'Present' ? 'bg-emerald-600' : emp.status === 'Remote' ? 'bg-blue-600' : 'bg-amber-600'
                            } text-white text-[8px] font-black`}>{emp.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Award className="w-4 h-4 text-[#F6B100]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Active Recruitment Pipeline</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { role: 'Senior Video Journalist', stage: 'Interview Panel', date: 'Today, 14:00' },
                    { role: 'Lead DevOps Cloud Architect', stage: 'Offer Stage', date: '30 Jun 2026' },
                    { role: 'Legal Compliance Officer', stage: 'Initial Screening', date: '02 Jul 2026' },
                  ].map((job) => (
                    <div key={job.role} className="flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 dark:text-white">{job.role}</p>
                        <p className="text-[10px] text-gray-400">{job.stage}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{job.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. FINANCE & LEDGER */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <DollarSign className="w-4 h-4 text-[#0057FF]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Budget Forecasts (Q2)</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-500">Allocated Budget</span>
                    <span className="text-gray-900 dark:text-white">₹4,20,00,000</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-500">Expenses Logged</span>
                    <span className="text-gray-900 dark:text-white">₹2,84,50,000</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">68% of Q2 budget spent. Operating within threshold limit.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Landmark className="w-4 h-4 text-[#F6B100]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Accounting Tax & Vendor Audit</h3>
                </div>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Vendor Invoices Pending</span>
                    <Badge className="bg-amber-600 text-white text-[8px] font-black">4 Awaiting Review</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Quarterly GST Filing Split</span>
                    <span className="text-gray-900 dark:text-white">18% GST Compliant logs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Direct Billing status</span>
                    <span className="text-emerald-600 font-bold">Audited & Reconciled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. LEGAL & CONTRACTS */}
        {activeTab === 'legal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileSignature className="w-4 h-4 text-[#0057FF]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Contracts & NDAs</h3>
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reporter Agremt. (Noida Bureau)</span>
                    <span className="text-[#0057FF]">View Signatures</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Content License (Reuters Synd.)</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">NDA - Senior Correspondents</span>
                    <span className="text-gray-400">14 Signed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="w-4 h-4 text-[#F6B100]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Intellectual Property & Trademarks</h3>
                </div>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">"Khabar Cut" Brand Trademark</span>
                    <Badge className="bg-emerald-600 text-white text-[8px] font-black">Registered</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Logo Design Copyright File</span>
                    <span className="text-gray-400">Filed (Ref: 1042-CR)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending Copyright Claims</span>
                    <span className="text-[#D90429] font-bold">0 Active Claims</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 5. GOVERNANCE & AUDITS */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Activity className="w-4 h-4 text-[#D90429]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Public Corrections & Retractions Logs</h3>
                </div>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clarification: Gold price article</span>
                    <span className="text-gray-400">Logged (28 Jun 2026)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Correction: State election numbers</span>
                    <span className="text-gray-400">Logged (24 Jun 2026)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Retractions Logged</span>
                    <span className="font-extrabold text-[#D90429]">0 Retractions (All clear)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <ShieldAlert className="w-4 h-4 text-[#0057FF]" />
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Fact-Check Compliance Queue</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { claim: 'Claim: Local rainfall broke a 50-year record', source: 'IMD database', confidence: '98% Confirmed' },
                    { claim: 'Claim: New tech valley to see ₹10k cr funding', source: 'Corporate announcements', confidence: '84% Confirmed' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/2 text-[11px] space-y-1">
                      <p className="font-bold text-gray-900 dark:text-white">{item.claim}</p>
                      <div className="flex justify-between text-gray-400">
                        <span>Source: {item.source}</span>
                        <span className="text-[#0057FF] font-bold">{item.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
