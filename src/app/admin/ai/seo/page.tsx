'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AISeoPage() {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [seoResult, setSeoResult] = React.useState<any>(null);
  const [isAuditing, setIsAuditing] = React.useState(false);

  const handleAudit = async () => {
    if (!title) {
      toast.error('Please input article title');
      return;
    }
    setIsAuditing(true);
    try {
      const res = await fetch('/api/admin/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const json = await res.json();
        setSeoResult(json);
        toast.success('SEO optimization parameters generated');
      } else {
        toast.error('Failed to run SEO audits');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsAuditing(false);
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
          <LineChart className="h-6 w-6 text-red-600" /> AI SEO Engine
        </h1>
        <p className="text-sm text-zinc-555">
          Audits keywords densities, suggests URLs, canonical structures, and OpenGraph descriptors automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Specification stack */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Content Input</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Article Title</label>
              <input
                type="text"
                placeholder="E.g., Quantum Research Center In Bengaluru"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Body Draft Text</label>
              <textarea
                placeholder="Paste article contents..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <Button onClick={handleAudit} disabled={isAuditing} className="w-full font-bold gap-2">
              {isAuditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Analyze & Generate Tags
            </Button>
          </CardContent>
        </Card>

        {/* Right Output Review canvas */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-3">SEO Audit Parameters</h3>

            {seoResult ? (
              <div className="space-y-4 text-sm font-semibold">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Meta Title</span>
                    <p className="text-zinc-850 dark:text-zinc-150 mt-1">{seoResult.metaTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Focus Keyword</span>
                    <Badge variant="secondary" className="mt-1">{seoResult.focusKeyword}</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Meta Description</span>
                  <p className="text-zinc-850 dark:text-zinc-150 mt-1">{seoResult.metaDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Suggested URL Slug</span>
                    <p className="text-zinc-500 mt-1 font-mono">{seoResult.slug}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Readability Index</span>
                    <p className="text-zinc-850 dark:text-zinc-150 mt-1">{seoResult.readabilityScore} / 100</p>
                  </div>
                </div>

                {seoResult.internalLinkSuggestions && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Internal Linking Suggestions</span>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {seoResult.internalLinkSuggestions.map((link: string) => (
                        <Badge key={link} variant="outline">{link}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400">
                <LineChart className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Generate meta titles and structured parameters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
