'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Cpu, ShieldAlert, LineChart, History, Settings2, Save, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [prompts, setPrompts] = React.useState<any>({ writer: '', seo: '', translator: '' });
  const [isSavingPrompts, setIsSavingPrompts] = React.useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/ai/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.prompts) setPrompts(json.prompts);
      }
    } catch {
      toast.error('Failed to load AI metrics');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const savePrompts = async () => {
    setIsSavingPrompts(true);
    try {
      const res = await fetch('/api/admin/ai/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts }),
      });
      if (res.ok) {
        toast.success('Prompt templates updated successfully');
      } else {
        toast.error('Failed to save prompts');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsSavingPrompts(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-zinc-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-semibold">Loading AI metrics...</span>
      </div>
    );
  }

  const creditsPercent = data ? Math.min(100, (data.creditsUsed / data.creditsLimit) * 100) : 0;

  const quickLinks = [
    { name: 'AI Article Writer', href: '/admin/ai/writer', desc: 'Compose reports automatically.', icon: Brain },
    { name: 'AI SEO engine', href: '/admin/ai/seo', desc: 'Audit tag density.', icon: LineChart },
    { name: 'AI Fact Checker', href: '/admin/ai/fact-check', desc: 'Verify reports integrity.', icon: ShieldAlert },
    { name: 'AI Translator', href: '/admin/ai/translator', desc: 'Multi-lingual localizer.', icon: Settings2 },
    { name: 'TV Scripts & Socials', href: '/admin/ai/scripts', desc: 'TV scripts & posts.', icon: History },
    { name: 'Virtual Teleprompter', href: '/admin/ai/anchor', desc: 'Anchor reading suite.', icon: Cpu },
    { name: 'Pipeline Automator', href: '/admin/ai/workflow', desc: 'Publishing workflow.', icon: Sparkles },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-red-600" /> AI Newsroom Control Center
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor LLM credit quotas, model failover logs, fact-checking accuracy, and editorial prompt instructions.
        </p>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credits usage meter */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Monthly AI Credits Limit</h3>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-zinc-850 dark:text-zinc-50">{data?.creditsUsed}</span>
              <span className="text-xs text-zinc-400 font-bold">/ {data?.creditsLimit} credits</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: `${creditsPercent}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Model status indicator */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Model Failover Routing</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-500">Gemini 1.5 Flash (Primary)</span>
                <Badge className="bg-emerald-600 border-none font-bold text-[8px] uppercase">Active</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-500">Claude 3.5 Sonnet (Secondary)</span>
                <Badge variant="outline" className="font-bold text-[8px] uppercase text-zinc-400">Standby</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-500">GPT-4o Mini (Tertiary)</span>
                <Badge variant="outline" className="font-bold text-[8px] uppercase text-zinc-400">Standby</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety & Moderate index */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Editorial Quality & Safety</h3>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-black text-zinc-850 dark:text-zinc-50">92%</span>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Average Quality Score</p>
              </div>
              <div className="border-l pl-4 dark:border-zinc-800">
                <span className="text-2xl font-black text-zinc-850 dark:text-zinc-50">0</span>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Policy Flags Triggered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch Suite */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Launch AI Assistant Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href}>
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:shadow-md hover:border-red-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="p-2 bg-red-50 dark:bg-zinc-900 text-red-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-red-500 transition-colors">
                      {link.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      {link.desc}
                    </p>
                  </div>
                  <div className="text-xs text-red-500 font-bold group-hover:translate-x-1 transition-transform pt-4">
                    Open Suite →
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Prompts editor workspace */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">System Prompt Engineering</h2>
              <p className="text-xs text-zinc-400">Configure global context templates loaded by AI modules.</p>
            </div>
            <Button size="sm" onClick={savePrompts} disabled={isSavingPrompts} className="font-bold gap-2">
              {isSavingPrompts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">AI Writer Editorial Specification</label>
              <textarea
                value={prompts.writer}
                onChange={(e) => setPrompts({ ...prompts, writer: e.target.value })}
                className="w-full min-h-[80px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">AI SEO Auditor System Instructions</label>
              <textarea
                value={prompts.seo}
                onChange={(e) => setPrompts({ ...prompts, seo: e.target.value })}
                className="w-full min-h-[80px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">AI Localization Translator Context</label>
              <textarea
                value={prompts.translator}
                onChange={(e) => setPrompts({ ...prompts, translator: e.target.value })}
                className="w-full min-h-[80px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
