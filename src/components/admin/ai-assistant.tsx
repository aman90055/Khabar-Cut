'use client';

import * as React from 'react';
import { Sparkles, Brain, X, Send, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I am your Khabar Cut AI Assistant. How can I help you write, verify, or optimize news today?' },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    if (!textToSend) setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: promptText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: json.response }]);
      } else {
        throw new Error('AI engine error');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Engine error: Make sure GEMINI_API_KEY is configured in your settings.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 duration-200 cursor-pointer flex items-center justify-center border-none outline-none group"
      >
        <Brain className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay backdrop */}
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">AI Writing Assistant</h2>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Powered by Gemini Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5 shrink-0">
              {[
                { label: 'Generate Headline', prompt: 'Generate 5 catchy headlines for a breaking news story about Indian technology growth.' },
                { label: 'SEO Meta Description', prompt: 'Write an optimized meta description (160 characters max) and SEO title for an article about budget updates.' },
                { label: 'Summarize Text', prompt: 'Summarize the core facts from this article into 2 clear sentences.' },
                { label: 'Suggest News Tags', prompt: 'Provide a list of 10 comma-separated news tags for a cricket match win story.' },
              ].map((act) => (
                <button
                  key={act.label}
                  onClick={() => handleSend(act.prompt)}
                  disabled={isLoading}
                  className="text-[10px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-500 hover:text-purple-600 px-2 py-1 rounded-lg transition-all"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 shrink-0">
                      <Brain className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none font-medium'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none font-semibold border relative'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="absolute right-2 bottom-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 shrink-0">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl rounded-tl-none p-4 border flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    <span className="text-[10px] text-zinc-400 font-semibold">Gemini is writing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask assistant to write or translate..."
                className="flex-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 focus:outline-none"
              />
              <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="shrink-0 h-9 w-9 p-0 rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
