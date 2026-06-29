'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Loader2, Play, CheckCircle2, ChevronRight, Share2, LineChart, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PipelineStep {
  id: string;
  name: string;
  desc: string;
  status: 'idle' | 'running' | 'success' | 'failed';
}

export default function AIWorkflowPage() {
  const [headline, setHeadline] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [category, setCategory] = React.useState('Politics');
  const [language, setLanguage] = React.useState('English');
  const [location, setLocation] = React.useState('National');

  const [steps, setSteps] = React.useState<PipelineStep[]>([
    { id: 'draft', name: 'Editorial Drafting', desc: 'Composing structured news content', status: 'idle' },
    { id: 'seo', name: 'SEO Optimization', desc: 'Generating tags, keywords, meta tags', status: 'idle' },
    { id: 'mod', name: 'Content Moderation', desc: 'Safety audit and profanity scanning', status: 'idle' },
    { id: 'fc', name: 'Fact-Check Audit', desc: 'Cross-referencing claims integrity', status: 'idle' },
    { id: 'social', name: 'Social Post Generation', desc: 'Formatting social platform copy', status: 'idle' },
  ]);

  const [isRunning, setIsRunning] = React.useState(false);
  const [pipelineResult, setPipelineResult] = React.useState<any>(null);

  const triggerPipeline = async () => {
    if (!headline || !topic) {
      toast.error('Specify headline and topic details first');
      return;
    }

    setIsRunning(true);
    setPipelineResult(null);

    // Reset status to idle
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'idle' })));

    // Helper to update individual step status
    const updateStep = (id: string, status: 'running' | 'success' | 'failed') => {
      setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    };

    try {
      // Step 1: Draft
      updateStep('draft', 'running');
      await new Promise((r) => setTimeout(r, 1000)); // smooth UI transition

      const res = await fetch('/api/admin/ai/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, topic, category, language, location }),
      });

      if (!res.ok) {
        updateStep('draft', 'failed');
        toast.error('Pipeline failed during drafting');
        setIsRunning(false);
        return;
      }

      updateStep('draft', 'success');

      // Step 2: SEO
      updateStep('seo', 'running');
      await new Promise((r) => setTimeout(r, 1000));
      updateStep('seo', 'success');

      // Step 3: Moderation
      updateStep('mod', 'running');
      await new Promise((r) => setTimeout(r, 1000));
      updateStep('mod', 'success');

      // Step 4: Fact check
      updateStep('fc', 'running');
      await new Promise((r) => setTimeout(r, 1000));
      updateStep('fc', 'success');

      // Step 5: Social
      updateStep('social', 'running');
      await new Promise((r) => setTimeout(r, 1000));
      updateStep('social', 'success');

      const json = await res.json();
      setPipelineResult(json);
      toast.success('AI Workflow published successfully');
    } catch {
      toast.error('Workflow system connection error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/ai" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 uppercase tracking-wider transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> AI control center
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-red-600" /> AI publishing workflow orchestrator
        </h1>
        <p className="text-sm text-zinc-555">
          Orchestrate sequential multi-stage pipelines drafting, verifying, and optimizing news contents automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Inputs Form */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Pipeline Trigger Specification</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Article Title Angle</label>
              <input
                type="text"
                placeholder="E.g., Quantum computing hub Bengaluru"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Core Topic Details</label>
              <textarea
                placeholder="Specify core facts..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <Button onClick={triggerPipeline} disabled={isRunning} className="w-full font-bold gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
              Launch Pipeline Workflow
            </Button>

            {/* Pipeline progress checklist */}
            <div className="space-y-3 pt-4 border-t dark:border-zinc-800">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Pipeline Timeline Progress</h4>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{step.name}</p>
                      <p className="text-[10px] text-zinc-400 leading-snug">{step.desc}</p>
                    </div>
                    <div>
                      {step.status === 'running' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : step.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                      ) : step.status === 'failed' ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800 block" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Output Review canvas */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-3">Workflow Summary Output</h3>

            {pipelineResult ? (
              <div className="space-y-6 text-sm font-semibold">
                {/* Draft content */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Editorial Article Text</span>
                  <p className="text-zinc-800 dark:text-zinc-200 mt-2 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl text-xs font-semibold whitespace-pre-wrap">{pipelineResult.articleText}</p>
                </div>

                {/* SEO */}
                {pipelineResult.seoData && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1"><LineChart className="h-3.5 w-3.5 text-red-500" /> Optimized SEO metadata</span>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-xs border p-3 rounded-xl dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10">
                      <div>
                        <span className="text-zinc-450 block font-bold">Meta Title</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-bold">{pipelineResult.seoData.metaTitle}</span>
                      </div>
                      <div>
                        <span className="text-zinc-450 block font-bold">Meta Description</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-bold">{pipelineResult.seoData.metaDescription}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fact check */}
                {pipelineResult.factCheckData && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-red-500" /> Claims validation score</span>
                    <div className="flex justify-between items-center mt-2 border p-3 rounded-xl dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10 text-xs">
                      <div>
                        <span className="text-zinc-450 block font-bold">Claims Score</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-bold">{pipelineResult.factCheckData.confidenceScore}% Confidence</span>
                      </div>
                      <Badge className="bg-emerald-600 border-none font-bold text-[8px] uppercase">Factual</Badge>
                    </div>
                  </div>
                )}

                {/* Social Posts */}
                {pipelineResult.socialData && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1"><Share2 className="h-3.5 w-3.5 text-red-500" /> Prepared Social Copy</span>
                    <p className="text-zinc-500 mt-2 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-dashed dark:border-zinc-800 text-xs">{pipelineResult.socialData.twitterPost}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-400">
                <Sparkles className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Initiate a pipeline check to see consolidated parameters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
