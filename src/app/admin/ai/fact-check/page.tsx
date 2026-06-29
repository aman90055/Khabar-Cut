'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AIFactCheckPage() {
  const [content, setContent] = React.useState('');
  const [result, setResult] = React.useState<any>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const handleVerify = async () => {
    if (!content) {
      toast.error('Specify reporting statements to verify');
      return;
    }
    setIsChecking(true);
    try {
      const res = await fetch('/api/admin/ai/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json);
        toast.success('Factual cross-referencing audit complete');
      } else {
        toast.error('Fact checking request failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsChecking(false);
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
          <ShieldAlert className="h-6 w-6 text-red-600" /> AI Fact Check Assistant
        </h1>
        <p className="text-sm text-zinc-555">
          Verifies claims, scans public statements, detects misinformation, and cross-references data dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Claims Specification</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Text / Transcript to Validate</label>
              <textarea
                placeholder="Paste quotes, figures, or claims..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[180px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <Button onClick={handleVerify} disabled={isChecking} className="w-full font-bold gap-2">
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Run Fact-Check Audit
            </Button>
          </CardContent>
        </Card>

        {/* Right Output */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-3">Validation Output</h3>

            {result ? (
              <div className="space-y-6 text-sm font-semibold">
                {/* Confidence */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Confidence Score</span>
                    <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200 mt-1">
                      {result.confidenceScore}%
                    </p>
                  </div>
                  <div>
                    {result.manualReviewRequired ? (
                      <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase gap-1">
                        <AlertTriangle className="h-3 w-3" /> Manual Review Flagged
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white font-bold text-[9px] uppercase gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Factual
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Verified Claims */}
                {result.verifiedClaims && result.verifiedClaims.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Verified Claims list</span>
                    <div className="space-y-2">
                      {result.verifiedClaims.map((claim: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start text-xs bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{claim}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flagged Claims */}
                {result.flaggedMisinformation && result.flaggedMisinformation.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Flagged Misinformation</span>
                    <div className="space-y-2">
                      {result.flaggedMisinformation.map((warn: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start text-xs bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-amber-600">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {result.factCheckNotes && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Verification Summary</span>
                    <p className="text-zinc-500 mt-1 leading-relaxed">{result.factCheckNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400">
                <ShieldAlert className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Factual audit results will render here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
