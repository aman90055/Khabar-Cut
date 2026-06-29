'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, ArrowLeft, Loader2, Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AIWriterPage() {
  const [headline, setHeadline] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [category, setCategory] = React.useState('Politics');
  const [language, setLanguage] = React.useState('English');
  const [location, setLocation] = React.useState('National');
  const [type, setType] = React.useState('Long Form Article');

  const [generatedText, setGeneratedText] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please specify a topic');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/ai/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, topic, keywords, category, language, location, type }),
      });
      if (res.ok) {
        const json = await res.json();
        setGeneratedText(json.articleText);
        setStats({ wordCount: json.wordCount, readingTime: json.readingTime });
        toast.success('Article drafted successfully');
      } else {
        toast.error('Failed to generate draft');
      }
    } catch {
      toast.error('Network connection error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success('Text copied to clipboard');
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
          <Brain className="h-6 w-6 text-red-600" /> AI News Article Writer
        </h1>
        <p className="text-sm text-zinc-555">
          Specify your reporting details and generate factual, ready-to-edit news articles in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form Parameter stack */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Article Specifications</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Headline / Angle Idea</label>
              <input
                type="text"
                placeholder="E.g., Bengaluru traffic control AI nodes"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Core Topic / Brief Info</label>
              <textarea
                placeholder="Describe details, dates, key players..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Keywords (Comma separated)</label>
              <input
                type="text"
                placeholder="E.g., Smart corridor, signal routing"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                >
                  {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Odia', 'Urdu', 'Gujarati', 'Marathi'].map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Article Format</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                >
                  {['Long Form Article', 'Short News', 'Breaking News', 'Explainer', 'Opinion Draft'].map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full font-bold gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Editorial Draft
            </Button>
          </CardContent>
        </Card>

        {/* Right Output Review canvas */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Generated Canvas</h3>
              {generatedText && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyText} className="font-bold gap-1.5 h-8">
                    <Copy className="h-3.5 w-3.5" /> Copy Text
                  </Button>
                </div>
              )}
            </div>

            {generatedText ? (
              <div className="space-y-6">
                {/* Stats */}
                {stats && (
                  <div className="flex gap-4 text-xs font-bold uppercase text-zinc-450 border-b pb-2 border-dashed dark:border-zinc-800">
                    <span>Words: {stats.wordCount}</span>
                    <span>•</span>
                    <span>Reading Time: {stats.readingTime} min</span>
                  </div>
                )}
                {/* Text render block */}
                <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-semibold text-zinc-850 dark:text-zinc-100">
                  {generatedText}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-400">
                <Brain className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Your generated editorial draft will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
