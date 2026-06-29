'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, ArrowLeft, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AITranslatorPage() {
  const [text, setText] = React.useState('');
  const [targetLanguage, setTargetLanguage] = React.useState('Hindi');
  const [translatedText, setTranslatedText] = React.useState('');
  const [isTranslating, setIsTranslating] = React.useState(false);

  const handleTranslate = async () => {
    if (!text) {
      toast.error('Specify text to translate');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch('/api/admin/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      });
      if (res.ok) {
        const json = await res.json();
        setTranslatedText(json.translatedText);
        toast.success('Translation completed');
      } else {
        toast.error('Failed to translate content');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(translatedText);
    toast.success('Translated content copied');
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
          <Settings2 className="h-6 w-6 text-red-600" /> AI Localization Translator
        </h1>
        <p className="text-sm text-zinc-555">
          Localize articles, tickers, SEO tags, and video descriptions instantly across 12 major Indian languages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Translation Inputs</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Target Indian Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              >
                {['Hindi', 'Bengali', 'Tamil', 'Telugu', 'Urdu', 'Odia', 'Gujarati', 'Marathi', 'Punjabi', 'Malayalam', 'Kannada', 'English'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Text to Translate</label>
              <textarea
                placeholder="Paste news text, summaries or metadata here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <Button onClick={handleTranslate} disabled={isTranslating} className="w-full font-bold gap-2">
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
              Translate Content
            </Button>
          </CardContent>
        </Card>

        {/* Right Output */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Translated Result</h3>
              {translatedText && (
                <Button variant="outline" size="sm" onClick={copyText} className="font-bold gap-1.5 h-8">
                  <Copy className="h-3.5 w-3.5" /> Copy Translation
                </Button>
              )}
            </div>

            {translatedText ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-semibold text-zinc-850 dark:text-zinc-100">
                {translatedText}
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-400">
                <Settings2 className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Your localized translation result will render here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
